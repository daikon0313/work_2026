# 全部mainに書く

# Compute Pool
resource "snowflake_compute_pool" "quiz_app" {
  name    = var.compute_pool_name
  comment = "Compute pool for quiz application"

  instance_family   = var.instance_family
  min_nodes         = var.min_nodes
  max_nodes         = var.max_nodes
  auto_resume       = var.auto_resume
  auto_suspend_secs = var.auto_suspend_secs
}

# Database (既存のデータベースを参照する場合はdata sourceを使用)
resource "snowflake_database" "quiz_db" {
  count   = var.create_database ? 1 : 0
  name    = var.database_name
  comment = "Database for quiz application"
}

# Schema for SPCS resources
resource "snowflake_schema" "quiz_schema" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  name     = var.schema_name
  comment  = "Schema for quiz application SPCS resources"
}

# Schema for quiz data
resource "snowflake_schema" "quiz_data_schema" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  name     = "QUIZ"
  comment  = "Schema for quiz application data (sessions and answers)"
}

# Image Repository
resource "snowflake_image_repository" "quiz_app" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  schema   = snowflake_schema.quiz_schema.name
  name     = var.image_repository_name
}

# Stage for service specification
resource "snowflake_stage" "service_spec" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  schema   = snowflake_schema.quiz_schema.name
  name     = var.stage_name
  comment  = "Stage for SPCS service specifications"
}

# Note: Network Rule and External Access Integration are created via SQL
# because they are not fully supported in Terraform Provider v2.12
# See deploy.sh for SQL creation commands

resource "snowflake_table" "quiz_sessions" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  schema   = snowflake_schema.quiz_data_schema.name
  name     = "QUIZ_SESSIONS"
  comment  = "Quiz session records with scores and completion times"

  column {
    name     = "SESSION_ID"
    type     = "VARCHAR(36)"
    nullable = false
    comment  = "Unique session identifier (UUID)"
  }

  column {
    name     = "USER_ID"
    type     = "VARCHAR(255)"
    nullable = true
    comment  = "User identifier (optional)"
  }

  column {
    name     = "SCORE"
    type     = "NUMBER(10,0)"
    nullable = false
    comment  = "Number of correct answers"
  }

  column {
    name     = "TOTAL_QUESTIONS"
    type     = "NUMBER(10,0)"
    nullable = false
    comment  = "Total number of questions"
  }

  column {
    name     = "CORRECT_RATE"
    type     = "NUMBER(5,2)"
    nullable = false
    comment  = "Percentage of correct answers"
  }

  column {
    name     = "COMPLETED_AT"
    type     = "TIMESTAMP_NTZ"
    nullable = false
    default {
      constant = "CURRENT_TIMESTAMP()"
    }
    comment = "Quiz completion timestamp"
  }

  column {
    name     = "CREATED_AT"
    type     = "TIMESTAMP_NTZ"
    nullable = false
    default {
      constant = "CURRENT_TIMESTAMP()"
    }
    comment = "Record creation timestamp"
  }

  primary_key {
    name = "PK_QUIZ_SESSIONS"
    keys = ["SESSION_ID"]
  }
}

resource "snowflake_table" "quiz_answers" {
  database = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
  schema   = snowflake_schema.quiz_data_schema.name
  name     = "QUIZ_ANSWERS"
  comment  = "Individual quiz answer records"

  column {
    name     = "ANSWER_ID"
    type     = "NUMBER(38,0)"
    nullable = false
    identity {
      start_num = 1
      step_num  = 1
    }
    comment = "Auto-incrementing answer ID"
  }

  column {
    name     = "SESSION_ID"
    type     = "VARCHAR(36)"
    nullable = false
    comment  = "Foreign key to QUIZ_SESSIONS"
  }

  column {
    name     = "QUESTION_ID"
    type     = "NUMBER(10,0)"
    nullable = false
    comment  = "Question identifier"
  }

  column {
    name     = "QUESTION_TEXT"
    type     = "VARCHAR(1000)"
    nullable = false
    comment  = "Question text"
  }

  column {
    name     = "SELECTED_ANSWER"
    type     = "NUMBER(10,0)"
    nullable = false
    comment  = "Index of selected answer"
  }

  column {
    name     = "CORRECT_ANSWER"
    type     = "NUMBER(10,0)"
    nullable = false
    comment  = "Index of correct answer"
  }

  column {
    name     = "IS_CORRECT"
    type     = "BOOLEAN"
    nullable = false
    comment  = "Whether the answer was correct"
  }

  column {
    name     = "CREATED_AT"
    type     = "TIMESTAMP_NTZ"
    nullable = false
    default {
      constant = "CURRENT_TIMESTAMP()"
    }
    comment = "Record creation timestamp"
  }

  primary_key {
    name = "PK_QUIZ_ANSWERS"
    keys = ["ANSWER_ID"]
  }
}

# Service (手動デプロイのためコメントアウト)
# Serviceは手動でデプロイしてください。以下のSQLを実行:
# USE DATABASE <your_database>;
# USE SCHEMA QUIZ_SPCS;
# CREATE SERVICE quiz_app_service_dev
#   IN COMPUTE POOL quiz_app_pool_dev
#   FROM @service_spec
#   SPEC='service.yaml';
#
# resource "snowflake_service" "quiz_app" {
#   database        = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
#   schema          = snowflake_schema.quiz_schema.name
#   name            = var.service_name
#   compute_pool    = snowflake_compute_pool.quiz_app.name
#   spec            = file("${path.module}/specs/service.yaml")
#   min_instances   = var.min_instances
#   max_instances   = var.max_instances
#   auto_resume     = var.service_auto_resume
#   comment         = "Quiz application service"
#
#   depends_on = [
#     snowflake_compute_pool.quiz_app,
#     snowflake_image_repository.quiz_app,
#     snowflake_stage.service_spec
#   ]
# }

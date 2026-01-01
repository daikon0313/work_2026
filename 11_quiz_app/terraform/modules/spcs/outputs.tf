/**
 * Outputs for SPCS Module
 */

output "compute_pool_name" {
  description = "Name of the created compute pool"
  value       = snowflake_compute_pool.quiz_app.name
}

output "image_repository_url" {
  description = "URL of the image repository"
  value       = "${var.database_name}.${snowflake_schema.quiz_schema.name}.${snowflake_image_repository.quiz_app.name}"
}

# Serviceは手動デプロイのため、以下の出力はコメントアウト
# output "service_name" {
#   description = "Name of the created service"
#   value       = snowflake_service.quiz_app.name
# }
#
# output "service_dns_name" {
#   description = "DNS name for the service (if available)"
#   value       = try(snowflake_service.quiz_app.dns_name, "")
# }

output "database_name" {
  description = "Name of the database"
  value       = var.create_database ? snowflake_database.quiz_db[0].name : var.database_name
}

output "schema_name" {
  description = "Name of the SPCS schema"
  value       = snowflake_schema.quiz_schema.name
}

output "quiz_data_schema_name" {
  description = "Name of the quiz data schema"
  value       = snowflake_schema.quiz_data_schema.name
}

output "quiz_sessions_table" {
  description = "Quiz sessions table fully qualified name"
  value       = "${snowflake_table.quiz_sessions.database}.${snowflake_table.quiz_sessions.schema}.${snowflake_table.quiz_sessions.name}"
}

output "quiz_answers_table" {
  description = "Quiz answers table fully qualified name"
  value       = "${snowflake_table.quiz_answers.database}.${snowflake_table.quiz_answers.schema}.${snowflake_table.quiz_answers.name}"
}

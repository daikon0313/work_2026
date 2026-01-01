/**
 * Development Environment Configuration
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    snowflake = {
      source  = "snowflakedb/snowflake"
      version = "~> 2.12.0"
    }
  }
}

# Snowflake Provider Configuration
# Provider v2.x でJWT認証を使用
# 参考: https://registry.terraform.io/providers/snowflakedb/snowflake/latest/docs/guides/authentication_methods
provider "snowflake" {
  organization_name        = var.snowflake_organization_name
  account_name             = var.snowflake_account_name
  user                     = var.snowflake_user
  authenticator            = "SNOWFLAKE_JWT"
  private_key              = file(var.snowflake_private_key_path)
  role                     = var.snowflake_role
  warehouse                = var.snowflake_warehouse
  preview_features_enabled = ["snowflake_stage_resource", "snowflake_table_resource"]
}

# SPCS Module
module "spcs" {
  source = "../../modules/spcs"

  # Compute Pool設定
  compute_pool_name = var.compute_pool_name
  instance_family   = var.instance_family
  min_nodes         = var.min_nodes
  max_nodes         = var.max_nodes
  auto_resume       = var.auto_resume
  auto_suspend_secs = var.auto_suspend_secs

  # Database設定
  create_database = var.create_database
  database_name   = var.database_name
  schema_name     = var.schema_name

  # Image Repository設定
  image_repository_name = var.image_repository_name

  # Service設定（手動デプロイのためコメントアウト）
  # service_name        = var.service_name
  # min_instances       = var.min_instances
  # max_instances       = var.max_instances
  # service_auto_resume = var.service_auto_resume
  # image_tag           = var.image_tag
}

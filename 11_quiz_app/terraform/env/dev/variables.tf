/**
 * Development Environment Variables
 */

# Snowflake認証情報
variable "snowflake_organization_name" {
  description = "Snowflake organization name"
  type        = string
}

variable "snowflake_account_name" {
  description = "Snowflake account name"
  type        = string
}

variable "snowflake_user" {
  description = "Snowflake user name"
  type        = string
}

variable "snowflake_role" {
  description = "Snowflake role to use"
  type        = string
  default     = "SYSADMIN"
}

variable "snowflake_private_key_path" {
  description = "Path to Snowflake private key file"
  type        = string
  sensitive   = true
}

variable "snowflake_warehouse" {
  description = "Snowflake warehouse to use"
  type        = string
  default     = "COMPUTE_WH"
}

# Compute Pool設定
variable "compute_pool_name" {
  description = "Name of the compute pool (must be uppercase)"
  type        = string
  default     = "QUIZ_APP_POOL_DEV"
}

variable "instance_family" {
  description = "Instance family for compute pool"
  type        = string
  default     = "CPU_X64_XS"
}

variable "min_nodes" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Maximum number of nodes"
  type        = number
  default     = 1
}

variable "auto_resume" {
  description = "Auto-resume compute pool"
  type        = bool
  default     = true
}

variable "auto_suspend_secs" {
  description = "Seconds before auto-suspend"
  type        = number
  default     = 600
}

# Database設定
variable "create_database" {
  description = "Create new database or use existing"
  type        = bool
  default     = false
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "schema_name" {
  description = "Schema name"
  type        = string
  default     = "QUIZ_SPCS"
}

# Image Repository設定
variable "image_repository_name" {
  description = "Image repository name (must be uppercase for unquoted identifier)"
  type        = string
  default     = "QUIZ_APP_REPO"
}

# Service設定（手動デプロイのためコメントアウト）
# variable "service_name" {
#   description = "SPCS service name"
#   type        = string
#   default     = "quiz_app_service_dev"
# }
#
# variable "min_instances" {
#   description = "Minimum service instances"
#   type        = number
#   default     = 1
# }
#
# variable "max_instances" {
#   description = "Maximum service instances"
#   type        = number
#   default     = 1
# }
#
# variable "service_auto_resume" {
#   description = "Auto-resume service"
#   type        = bool
#   default     = true
# }
#
# variable "image_tag" {
#   description = "Container image tag"
#   type        = string
#   default     = "dev"
# }

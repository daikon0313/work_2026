/**
 * Variables for SPCS Module
 */

# Compute Pool Variables
variable "compute_pool_name" {
  description = "Name of the compute pool"
  type        = string
}

variable "instance_family" {
  description = "Instance family for compute pool (CPU_X64_XS, CPU_X64_S, etc.)"
  type        = string
  default     = "CPU_X64_XS"
}

variable "min_nodes" {
  description = "Minimum number of nodes in compute pool"
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Maximum number of nodes in compute pool"
  type        = number
  default     = 1
}

variable "auto_resume" {
  description = "Whether compute pool should auto-resume"
  type        = bool
  default     = true
}

variable "auto_suspend_secs" {
  description = "Seconds of inactivity before auto-suspend"
  type        = number
  default     = 600
}

# Database Variables
variable "create_database" {
  description = "Whether to create a new database or use existing"
  type        = bool
  default     = false
}

variable "database_name" {
  description = "Name of the database"
  type        = string
}

variable "schema_name" {
  description = "Name of the schema"
  type        = string
  default     = "QUIZ_SPCS"
}

# Image Repository Variables
variable "image_repository_name" {
  description = "Name of the image repository"
  type        = string
  default     = "quiz_app_repo"
}

# Stage Variables
variable "stage_name" {
  description = "Name of the stage for service specs"
  type        = string
  default     = "SERVICE_SPECS"
}

# Service Variables (手動デプロイのためコメントアウト)
# variable "service_name" {
#   description = "Name of the SPCS service"
#   type        = string
#   default     = "quiz_app_service"
# }
#
# variable "min_instances" {
#   description = "Minimum number of service instances"
#   type        = number
#   default     = 1
# }
#
# variable "max_instances" {
#   description = "Maximum number of service instances"
#   type        = number
#   default     = 1
# }
#
# variable "service_auto_resume" {
#   description = "Whether service should auto-resume"
#   type        = bool
#   default     = true
# }

# Container Image Variables (手動デプロイのためコメントアウト)
# variable "image_tag" {
#   description = "Tag for the container image"
#   type        = string
#   default     = "latest"
# }

/**
 * Development Environment Outputs
 */

output "compute_pool_name" {
  description = "Compute pool name"
  value       = module.spcs.compute_pool_name
}

output "image_repository_url" {
  description = "Image repository URL"
  value       = module.spcs.image_repository_url
}

# Service関連のoutputは手動デプロイのためコメントアウト
# output "service_name" {
#   description = "Service name"
#   value       = module.spcs.service_name
# }
#
# output "service_dns_name" {
#   description = "Service DNS name"
#   value       = module.spcs.service_dns_name
# }

output "database_name" {
  description = "Database name"
  value       = module.spcs.database_name
}

output "schema_name" {
  description = "SPCS schema name"
  value       = module.spcs.schema_name
}

output "quiz_data_schema_name" {
  description = "Quiz data schema name"
  value       = module.spcs.quiz_data_schema_name
}

output "quiz_sessions_table" {
  description = "Quiz sessions table"
  value       = module.spcs.quiz_sessions_table
}

output "quiz_answers_table" {
  description = "Quiz answers table"
  value       = module.spcs.quiz_answers_table
}

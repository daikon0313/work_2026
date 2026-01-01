/**
 * Terraform Backend Configuration
 *
 * Uncomment and configure for remote state management
 */

# terraform {
#   backend "s3" {
#     bucket = "your-terraform-state-bucket"
#     key    = "quiz-app/dev/terraform.tfstate"
#     region = "us-east-1"
#   }
# }

# または Snowflake バックエンド (experimental)
# terraform {
#   backend "snowflake" {
#     account  = "YOUR_ACCOUNT"
#     user     = "YOUR_USERNAME"
#     database = "TERRAFORM_STATE"
#     schema   = "PUBLIC"
#     table    = "tfstate"
#   }
# }

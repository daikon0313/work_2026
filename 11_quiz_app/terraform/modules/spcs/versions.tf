/**
 * Provider requirements for SPCS Module
 * モジュール内でsnowflake_*リソースを使用する場合、
 * 正しいプロバイダーソースを明示する必要があります
 */

terraform {
  required_providers {
    snowflake = {
      source = "snowflakedb/snowflake"
      # バージョンはルートモジュールで管理
    }
  }
}

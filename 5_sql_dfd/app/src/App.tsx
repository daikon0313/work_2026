import { useState, useEffect, useCallback } from 'react'
import SQLEditor from './components/SQLEditor'
import DFDViewer from './components/DFDViewer'
import { parseSQLToAPI, checkAPIHealth } from './utils/sqlParser'
import type { DFDData } from './types/sql'
import './App.css'

const SAMPLE_SQL = `with day_int_generic_kddi_cust_join_mst as (
   select * from {{ ref('DAY_INT_GENERIC_KDDI_CUST_JOIN_MST') }}
   where
       sys_hubble_date_key = {{ get_sys_hubble_date_key(model) }}
       and cust_info_coll_company_flg = '0'
       and source_customer_info_table = 'F'
),

cleansed_quest_day_us_a_equip_external_table as (
   select * from {{ ref('CLEANSED_QUEST_DAY_US_A_EQUIP_EXTERNAL_TABLE') }}
   where sys_hubble_date_key = {{ get_sys_hubble_date_key(model) }}
),

customer_1 as (
   select
       sys_hubble_date_key,
       cust_info_ym as ym,
       cust_info_subs_rk as subs_rk,
       cust_info_subs_type as subs_type,
       user_complement_age
   from
       day_int_generic_kddi_cust_join_mst
),

kisyu_gaibu_table_1 as (
   select
       equip_sys_rk,
       s_category_1_cd,
       s_category_2_cd
   from
       cleansed_quest_day_us_a_equip_external_table
),

customer_2 as (
   select
       main.*,
       kisyu.s_category_1_cd,
       kisyu.s_category_2_cd
   from
       customer_1 as main
   left outer join kisyu_gaibu_table_1 as kisyu
       on main.subs_rk = kisyu.equip_sys_rk
)

select * from customer_2`

function App() {
  const [sql, setSql] = useState(SAMPLE_SQL)
  const [dfdData, setDfdData] = useState<DFDData>({ nodes: [], edges: [] })
  const [separateLogicNodes, setSeparateLogicNodes] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

  // APIヘルスチェック
  useEffect(() => {
    checkAPIHealth().then(setApiAvailable)
  }, [])

  // SQLパース
  const parseSql = useCallback(async () => {
    if (!sql.trim()) {
      setDfdData({ nodes: [], edges: [] })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await parseSQLToAPI(sql, separateLogicNodes)
      setDfdData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse SQL')
      setDfdData({ nodes: [], edges: [] })
    } finally {
      setIsLoading(false)
    }
  }, [sql, separateLogicNodes])

  // SQLが変更されたらデバウンス付きでパース
  useEffect(() => {
    if (apiAvailable === false) return

    const timer = setTimeout(() => {
      parseSql()
    }, 500)

    return () => clearTimeout(timer)
  }, [sql, separateLogicNodes, apiAvailable, parseSql])

  return (
    <div className="app">
      <header className="app-header">
        <h1>SQL to DFD Converter</h1>
        <p>dbt SQLからデータフロー図を自動生成</p>
        <div className="header-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={separateLogicNodes}
              onChange={(e) => setSeparateLogicNodes(e.target.checked)}
            />
            ロジックノードを分離
          </label>
          {apiAvailable === false && (
            <span className="api-warning">⚠️ API未接続 (localhost:8000)</span>
          )}
          {isLoading && <span className="loading">解析中...</span>}
        </div>
      </header>
      <main className="app-main">
        <div className="panel panel-left">
          <SQLEditor value={sql} onChange={setSql} />
        </div>
        <div className="panel panel-right">
          {error && <div className="error-message">{error}</div>}
          <DFDViewer data={dfdData} />
        </div>
      </main>
    </div>
  )
}

export default App

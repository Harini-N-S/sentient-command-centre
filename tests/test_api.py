"""
Rawbank Sentient Fraud Intelligence Platform
Phase 4 Backend API Test Suite
-----------------------------------------------------------------------------
Comprehensive regression and endpoint validation against the live synthetic database.
Covers all 24 required test scenarios without mocking the database away.
"""

import sys
import unittest
import sqlite3
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.config import settings
from backend.app.database import create_connection


class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Verify the database exists
        if not settings.database_path.exists():
            raise RuntimeError(f"Database not found at: {settings.database_path}")

    # 1. Health endpoint
    def test_01_health_endpoint(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["database"], "connected")
        self.assertGreaterEqual(data["table_count"], 9)
        self.assertIn("timestamp", data)

    # 2. Overview endpoint
    def test_02_overview_endpoint(self):
        resp = self.client.get("/api/overview")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_customers"], 120)
        self.assertEqual(data["total_accounts"], 240)
        self.assertEqual(data["total_transactions"], 900)
        self.assertEqual(data["total_alerts"], 140)
        self.assertEqual(data["total_fraud_signals"], 200)
        self.assertGreater(data["critical_alerts"], 0)
        self.assertGreater(data["total_volume_usd"], 0)
        self.assertIn("NEW_UNASSIGNED", data["alerts_by_status"])

    # 3. Alert listing
    def test_03_alert_listing(self):
        resp = self.client.get("/api/alerts?page=1&page_size=15")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("items", data)
        self.assertIn("pagination", data)
        self.assertEqual(len(data["items"]), 15)
        self.assertEqual(data["pagination"]["page"], 1)
        self.assertEqual(data["pagination"]["page_size"], 15)
        self.assertEqual(data["pagination"]["total"], 140)

    # 4. Alert filtering
    def test_04_alert_filtering(self):
        # Filter by severity = CRITICAL
        resp = self.client.get("/api/alerts?severity=CRITICAL")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data["items"]), 0)
        for item in data["items"]:
            self.assertEqual(item["severity"], "CRITICAL")

        # Filter by customer_id
        resp = self.client.get("/api/alerts?customer_id=CUS-00014")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        for item in data["items"]:
            self.assertEqual(item["customer_id"], "CUS-00014")

    # 5. Alert detail
    def test_05_alert_detail(self):
        resp = self.client.get("/api/alerts/ALT-00001")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("alert", data)
        self.assertEqual(data["alert"]["alert_id"], "ALT-00001")
        self.assertIn("customer", data)
        self.assertIn("transaction", data)
        self.assertIn("signals", data)
        self.assertGreater(len(data["signals"]), 0)

    # 6. Missing alert
    def test_06_missing_alert(self):
        resp = self.client.get("/api/alerts/ALT-99999")
        self.assertEqual(resp.status_code, 404)
        data = resp.json()
        self.assertIn("detail", data)

    # 7. Transaction listing
    def test_07_transaction_listing(self):
        resp = self.client.get("/api/transactions?page=1&page_size=20")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["items"]), 20)
        self.assertEqual(data["pagination"]["total"], 900)

    # 8. Transaction detail
    def test_08_transaction_detail(self):
        resp = self.client.get("/api/transactions/TXN-00801")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("transaction", data)
        self.assertEqual(data["transaction"]["transaction_id"], "TXN-00801")
        self.assertIn("customer", data)
        self.assertIn("account", data)
        self.assertIn("beneficiary", data)
        self.assertIn("device", data)
        self.assertIn("deterministic_evaluation", data)
        self.assertIn("evidence_packet", data)

    # 9. Missing transaction
    def test_09_missing_transaction(self):
        resp = self.client.get("/api/transactions/TXN-99999")
        self.assertEqual(resp.status_code, 404)
        data = resp.json()
        self.assertIn("detail", data)

    # 10. Customer detail
    def test_10_customer_detail(self):
        resp = self.client.get("/api/customers/CUS-00014")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("customer", data)
        self.assertEqual(data["customer"]["customer_id"], "CUS-00014")
        self.assertIn("accounts", data)
        self.assertIn("activity_summary", data)
        self.assertIn("recent_transactions", data)
        self.assertIn("behavioural_baseline", data)
        self.assertIn("devices", data)
        self.assertIn("beneficiaries", data)
        self.assertIn("recent_auth_events", data)
        self.assertIn("risk", data)
        self.assertIn("relationships", data)

    # 11. Missing customer
    def test_11_missing_customer(self):
        resp = self.client.get("/api/customers/CUS-99999")
        self.assertEqual(resp.status_code, 404)

    # 12. Device detail
    def test_12_device_detail(self):
        resp = self.client.get("/api/devices/DEV-00127")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("device", data)
        self.assertEqual(data["device"]["device_id"], "DEV-00127")
        self.assertIn("associated_customers", data)
        self.assertIn("recent_transactions", data)

    # 13. Beneficiary detail
    def test_13_beneficiary_detail(self):
        resp = self.client.get("/api/beneficiaries/BEN-00088")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("beneficiary", data)
        self.assertEqual(data["beneficiary"]["beneficiary_id"], "BEN-00088")
        self.assertIn("interacting_customers", data)
        self.assertIn("transaction_count", data)

    # 14. Relationship endpoint
    def test_14_relationship_endpoint(self):
        # Customer relationships
        resp = self.client.get("/api/entities/customer/CUS-00014/relationships")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["entity_type"], "customer")
        self.assertEqual(data["entity_id"], "CUS-00014")
        self.assertGreater(data["total_relationships"], 0)
        self.assertIn("relationships", data)

        # Device relationships
        resp = self.client.get("/api/entities/device/DEV-00127/relationships")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["entity_type"], "device")

    # 15. Signal listing
    def test_15_signal_listing(self):
        resp = self.client.get("/api/signals?page=1&page_size=20")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["items"]), 20)
        self.assertEqual(data["pagination"]["total"], 200)

    # 16. Signal detail
    def test_16_signal_detail(self):
        resp = self.client.get("/api/signals/SIG-00001")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("signal", data)
        self.assertEqual(data["signal"]["signal_id"], "SIG-00001")
        self.assertEqual(data["signal"]["rule_code"], "R-ATO-05")
        self.assertIn("calculated_values", data)

    # 17. Transaction evaluation
    def test_17_transaction_evaluation(self):
        resp = self.client.post("/api/evaluate/transaction/TXN-00801")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["transaction_id"], "TXN-00801")
        self.assertTrue(data["is_flagged"])
        self.assertGreaterEqual(data["risk_score"], 80)
        self.assertEqual(data["severity"], "CRITICAL")
        self.assertGreater(len(data["signals"]), 0)
        self.assertIn("scoring_breakdown", data)

    # 18. Customer evaluation
    def test_18_customer_evaluation(self):
        resp = self.client.post("/api/evaluate/customer/CUS-00014?limit=5")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["customer_id"], "CUS-00014")
        self.assertGreater(data["evaluated_transactions_count"], 0)
        self.assertIn("summary", data)
        self.assertIn("transaction_evaluations", data)

    # 19. Evidence endpoint
    def test_19_evidence_endpoint(self):
        # Test dedicated endpoint /api/evidence/{id}
        resp = self.client.get("/api/evidence/TXN-00801")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["transaction_id"], "TXN-00801")
        self.assertIn("tier_1_exact_data", data)
        self.assertIn("tier_2_calculated", data)
        self.assertIn("tier_3_retrieved_evidence", data)
        # Guarantee Tier 4 is strictly None
        self.assertIsNone(data["tier_4_ai_reasoning"])

        # Also test aliased endpoint /api/transactions/{id}/evidence
        resp_alias = self.client.get("/api/transactions/TXN-00801/evidence")
        self.assertEqual(resp_alias.status_code, 200)
        self.assertEqual(resp_alias.json()["transaction_id"], "TXN-00801")

    # 20. Search endpoint
    def test_20_search_endpoint(self):
        # Search for customer ID
        resp = self.client.get("/api/search?q=CUS-00014")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(data["total_results"], 0)
        self.assertEqual(data["results"][0]["entity_id"], "CUS-00014")

        # Search for hardware model
        resp2 = self.client.get("/api/search?q=iPhone")
        self.assertEqual(resp2.status_code, 200)
        self.assertGreater(resp2.json()["total_results"], 0)

    # 21. Pagination
    def test_21_pagination(self):
        resp = self.client.get("/api/alerts?page=2&page_size=10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["items"]), 10)
        self.assertEqual(data["pagination"]["page"], 2)
        self.assertEqual(data["pagination"]["page_size"], 10)
        self.assertTrue(data["pagination"]["has_prev"])

    # 22. Invalid pagination
    def test_22_invalid_pagination(self):
        # Page < 1 triggers 422
        resp = self.client.get("/api/alerts?page=0")
        self.assertEqual(resp.status_code, 422)

        # Page size > 100 triggers 422
        resp2 = self.client.get("/api/alerts?page_size=500")
        self.assertEqual(resp2.status_code, 422)

    # 23. Invalid filter
    def test_23_invalid_filter(self):
        # Invalid severity
        resp = self.client.get("/api/alerts?severity=SUPER_CRITICAL")
        self.assertEqual(resp.status_code, 400)

        # Invalid currency
        resp2 = self.client.get("/api/transactions?currency=EUR")
        self.assertEqual(resp2.status_code, 400)

    # 24. Database / input failure handling
    def test_24_failure_handling(self):
        # Invalid entity type in relationship endpoint
        resp = self.client.get("/api/entities/satellite_dish/SAT-01/relationships")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Unsupported entity type", resp.json()["detail"])

        # Nonexistent entity in relationship endpoint
        resp2 = self.client.get("/api/entities/customer/CUS-99999/relationships")
        self.assertEqual(resp2.status_code, 404)

    # 25. Transaction filtering regression
    def test_25_transaction_filtering_regression(self):
        # All Channels / Unfiltered
        resp = self.client.get("/api/transactions?page=1&page_size=10")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 900)

        # Channel: Mobile Banking App via IllicoCash_App and MOBILE_APP alias
        resp_m1 = self.client.get("/api/transactions?channel=IllicoCash_App")
        self.assertEqual(resp_m1.status_code, 200)
        self.assertEqual(resp_m1.json()["pagination"]["total"], 581)

        resp_m2 = self.client.get("/api/transactions?channel=MOBILE_APP")
        self.assertEqual(resp_m2.status_code, 200)
        self.assertEqual(resp_m2.json()["pagination"]["total"], 581)

        # Channel: Web Portal / RawbankOnline_Web
        resp_web = self.client.get("/api/transactions?channel=RawbankOnline_Web")
        self.assertEqual(resp_web.status_code, 200)
        self.assertEqual(resp_web.json()["pagination"]["total"], 114)

        resp_web_alias = self.client.get("/api/transactions?channel=ONLINE_BANKING")
        self.assertEqual(resp_web_alias.status_code, 200)
        self.assertEqual(resp_web_alias.json()["pagination"]["total"], 114)

        # Channel: Agency Banking / Agency_Express_POS
        resp_agency = self.client.get("/api/transactions?channel=Agency_Express_POS")
        self.assertEqual(resp_agency.status_code, 200)
        self.assertEqual(resp_agency.json()["pagination"]["total"], 117)

        resp_agency_alias = self.client.get("/api/transactions?channel=AGENCY_BANKING")
        self.assertEqual(resp_agency_alias.status_code, 200)
        self.assertEqual(resp_agency_alias.json()["pagination"]["total"], 117)

        # Channel: ATM / ATM_Cardless
        resp_atm = self.client.get("/api/transactions?channel=ATM_Cardless")
        self.assertEqual(resp_atm.status_code, 200)
        self.assertEqual(resp_atm.json()["pagination"]["total"], 88)

        resp_atm_alias = self.client.get("/api/transactions?channel=ATM")
        self.assertEqual(resp_atm_alias.status_code, 200)
        self.assertEqual(resp_atm_alias.json()["pagination"]["total"], 88)

        # Currency: USD
        resp_usd = self.client.get("/api/transactions?currency=USD")
        self.assertEqual(resp_usd.status_code, 200)
        self.assertEqual(resp_usd.json()["pagination"]["total"], 443)

        # Currency: CDF
        resp_cdf = self.client.get("/api/transactions?currency=CDF")
        self.assertEqual(resp_cdf.status_code, 200)
        self.assertEqual(resp_cdf.json()["pagination"]["total"], 457)

        # Currency: Combined "CDF & USD" label does not crash or query literal
        resp_comb = self.client.get("/api/transactions?currency=CDF%20%26%20USD")
        self.assertEqual(resp_comb.status_code, 200)
        self.assertEqual(resp_comb.json()["pagination"]["total"], 900)

        # Combined Channel + Currency: Mobile Banking App + USD
        resp_both1 = self.client.get("/api/transactions?channel=MOBILE_APP&currency=USD")
        self.assertEqual(resp_both1.status_code, 200)
        self.assertEqual(resp_both1.json()["pagination"]["total"], 298)

        # Combined Channel + Currency: Mobile Banking App + CDF
        resp_both2 = self.client.get("/api/transactions?channel=MOBILE_APP&currency=CDF")
        self.assertEqual(resp_both2.status_code, 200)
        self.assertEqual(resp_both2.json()["pagination"]["total"], 283)

        # Customer ID filter
        resp_cus = self.client.get("/api/transactions?customer_id=CUS-00014")
        self.assertEqual(resp_cus.status_code, 200)
        self.assertEqual(resp_cus.json()["pagination"]["total"], 9)

        # Beneficiary ID filter
        resp_ben = self.client.get("/api/transactions?beneficiary_id=BEN-00088")
        self.assertEqual(resp_ben.status_code, 200)
        self.assertEqual(resp_ben.json()["pagination"]["total"], 10)

        # Location City filter
        resp_city = self.client.get("/api/transactions?location_city=Kinshasa")
        self.assertEqual(resp_city.status_code, 200)
        self.assertEqual(resp_city.json()["pagination"]["total"], 407)


if __name__ == "__main__":
    unittest.main()

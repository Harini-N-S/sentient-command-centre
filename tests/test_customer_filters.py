"""
Customer Filters Regression Test Suite
-----------------------------------------------------------------------------
Comprehensive validation for all customer filter scenarios on /api/customers:
1. All Segments
2. Individual Segment options
3. All KYC Statuses
4. Individual KYC Status options
5. All Risk Tiers
6. Individual Risk Category options
7. Registered City
8. Combined filters
9. Reset Filters
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings


class TestCustomerFilters(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        if not settings.database_path.exists():
            raise RuntimeError(f"Database not found at: {settings.database_path}")

    # -------------------------------------------------------------------------
    # 1. All Segments
    # -------------------------------------------------------------------------
    def test_01_all_segments(self):
        # Default request without segment filter
        resp = self.client.get("/api/customers?page=1&page_size=100")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["pagination"]["total"], 120)

        # Empty segment string
        resp_empty = self.client.get("/api/customers?segment=")
        self.assertEqual(resp_empty.status_code, 200)
        self.assertEqual(resp_empty.json()["pagination"]["total"], 120)

        # "ALL" segment alias
        resp_all = self.client.get("/api/customers?segment=ALL")
        self.assertEqual(resp_all.status_code, 200)
        self.assertEqual(resp_all.json()["pagination"]["total"], 120)

        # "All Segments" alias
        resp_all_labels = self.client.get("/api/customers?segment=All%20Segments")
        self.assertEqual(resp_all_labels.status_code, 200)
        self.assertEqual(resp_all_labels.json()["pagination"]["total"], 120)

    # -------------------------------------------------------------------------
    # 2. Individual Segment options
    # -------------------------------------------------------------------------
    def test_02_individual_segments(self):
        # Retail Individual: RETAIL (UI code) or Retail (DB canonical) -> 73 customers
        for seg in ["RETAIL", "Retail", "Retail Individual"]:
            resp = self.client.get(f"/api/customers?segment={seg}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on segment={seg}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 73, f"Mismatch for segment={seg}")
            for item in data["items"]:
                self.assertEqual(item["customer_segment"].lower(), "retail")

        # SME Commercial: SME (UI code / DB canonical) -> 29 customers
        for seg in ["SME", "SME Commercial"]:
            resp = self.client.get(f"/api/customers?segment={seg}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on segment={seg}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 29, f"Mismatch for segment={seg}")
            for item in data["items"]:
                self.assertEqual(item["customer_segment"].lower(), "sme")

        # Large Corporate: CORPORATE (UI code) or Corporate (DB canonical) -> 3 customers
        for seg in ["CORPORATE", "Corporate", "Large Corporate"]:
            resp = self.client.get(f"/api/customers?segment={seg}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on segment={seg}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 3, f"Mismatch for segment={seg}")
            for item in data["items"]:
                self.assertEqual(item["customer_segment"].lower(), "corporate")

        # Private Banking VIP: VIP (UI code) or HNWI (DB canonical) -> 4 customers
        for seg in ["VIP", "HNWI", "Private Banking VIP"]:
            resp = self.client.get(f"/api/customers?segment={seg}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on segment={seg}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 4, f"Mismatch for segment={seg}")
            for item in data["items"]:
                self.assertEqual(item["customer_segment"], "HNWI")

        # Agency Banking: AGENCY_BANKING or AgencyBankingOperator -> 11 customers
        for seg in ["AGENCY_BANKING", "AgencyBankingOperator", "Agency Banking"]:
            resp = self.client.get(f"/api/customers?segment={seg}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on segment={seg}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 11, f"Mismatch for segment={seg}")
            for item in data["items"]:
                self.assertEqual(item["customer_segment"], "AgencyBankingOperator")

    # -------------------------------------------------------------------------
    # 3. All KYC Statuses
    # -------------------------------------------------------------------------
    def test_03_all_kyc_statuses(self):
        resp = self.client.get("/api/customers?page=1&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 120)

        resp_empty = self.client.get("/api/customers?kyc_status=")
        self.assertEqual(resp_empty.status_code, 200)
        self.assertEqual(resp_empty.json()["pagination"]["total"], 120)

        resp_all = self.client.get("/api/customers?kyc_status=ALL")
        self.assertEqual(resp_all.status_code, 200)
        self.assertEqual(resp_all.json()["pagination"]["total"], 120)

        resp_label = self.client.get("/api/customers?kyc_status=All%20KYC%20Statuses")
        self.assertEqual(resp_label.status_code, 200)
        self.assertEqual(resp_label.json()["pagination"]["total"], 120)

    # -------------------------------------------------------------------------
    # 4. Individual KYC Status options
    # -------------------------------------------------------------------------
    def test_04_individual_kyc_statuses(self):
        # FULL Verification: FULL (UI code) or Tier_3_Full (DB canonical) -> 37 customers
        for kyc in ["FULL", "Tier_3_Full", "FULL Verification"]:
            resp = self.client.get(f"/api/customers?kyc_status={kyc}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on kyc_status={kyc}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 37, f"Mismatch for kyc_status={kyc}")
            for item in data["items"]:
                self.assertEqual(item["kyc_status"], "Tier_3_Full")

        # PARTIAL Verification: PARTIAL (UI code) or Tier_2_Standard (DB canonical) -> 57 customers
        for kyc in ["PARTIAL", "Tier_2_Standard", "PARTIAL Verification"]:
            resp = self.client.get(f"/api/customers?kyc_status={kyc}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on kyc_status={kyc}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 57, f"Mismatch for kyc_status={kyc}")
            for item in data["items"]:
                self.assertEqual(item["kyc_status"], "Tier_2_Standard")

        # PENDING Verification: PENDING (UI code) or Tier_1_Basic (DB canonical) -> 26 customers
        for kyc in ["PENDING", "Tier_1_Basic", "PENDING Verification"]:
            resp = self.client.get(f"/api/customers?kyc_status={kyc}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on kyc_status={kyc}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 26, f"Mismatch for kyc_status={kyc}")
            for item in data["items"]:
                self.assertEqual(item["kyc_status"], "Tier_1_Basic")

    # -------------------------------------------------------------------------
    # 5. All Risk Tiers
    # -------------------------------------------------------------------------
    def test_05_all_risk_tiers(self):
        resp = self.client.get("/api/customers?page=1&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 120)

        resp_empty = self.client.get("/api/customers?risk_category=")
        self.assertEqual(resp_empty.status_code, 200)
        self.assertEqual(resp_empty.json()["pagination"]["total"], 120)

        resp_all = self.client.get("/api/customers?risk_category=ALL")
        self.assertEqual(resp_all.status_code, 200)
        self.assertEqual(resp_all.json()["pagination"]["total"], 120)

        resp_label = self.client.get("/api/customers?risk_category=All%20Risk%20Tiers")
        self.assertEqual(resp_label.status_code, 200)
        self.assertEqual(resp_label.json()["pagination"]["total"], 120)

    # -------------------------------------------------------------------------
    # 6. Individual Risk Category options
    # -------------------------------------------------------------------------
    def test_06_individual_risk_categories(self):
        # LOW: LOW (UI code) or Low (DB canonical) -> 87 customers
        for risk in ["LOW", "Low", "LOW Risk Tier"]:
            resp = self.client.get(f"/api/customers?risk_category={risk}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on risk_category={risk}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 87, f"Mismatch for risk_category={risk}")
            for item in data["items"]:
                self.assertEqual(item["risk_category"], "Low")

        # MEDIUM: MEDIUM (UI code) or Medium (DB canonical) -> 24 customers
        for risk in ["MEDIUM", "Medium", "MEDIUM Risk Tier"]:
            resp = self.client.get(f"/api/customers?risk_category={risk}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on risk_category={risk}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 24, f"Mismatch for risk_category={risk}")
            for item in data["items"]:
                self.assertEqual(item["risk_category"], "Medium")

        # HIGH: HIGH (UI code) or High (DB canonical) -> 9 customers
        for risk in ["HIGH", "High", "HIGH Risk Tier"]:
            resp = self.client.get(f"/api/customers?risk_category={risk}&page_size=100")
            self.assertEqual(resp.status_code, 200, f"Failed on risk_category={risk}")
            data = resp.json()
            self.assertEqual(data["pagination"]["total"], 9, f"Mismatch for risk_category={risk}")
            for item in data["items"]:
                self.assertEqual(item["risk_category"], "High")

    # -------------------------------------------------------------------------
    # 7. Registered City Filter
    # -------------------------------------------------------------------------
    def test_07_registered_city(self):
        city_counts = {
            "Kinshasa": 53,
            "Lubumbashi": 30,
            "Kolwezi": 13,
            "Goma": 11,
            "Matadi": 9,
            "Bukavu": 4
        }
        for city, expected_count in city_counts.items():
            # Test city parameter
            resp_city = self.client.get(f"/api/customers?city={city}&page_size=100")
            self.assertEqual(resp_city.status_code, 200, f"Failed on city={city}")
            self.assertEqual(resp_city.json()["pagination"]["total"], expected_count)
            for item in resp_city.json()["items"]:
                self.assertEqual(item["registered_city"].lower(), city.lower())

            # Test registered_city parameter
            resp_reg = self.client.get(f"/api/customers?registered_city={city}&page_size=100")
            self.assertEqual(resp_reg.status_code, 200, f"Failed on registered_city={city}")
            self.assertEqual(resp_reg.json()["pagination"]["total"], expected_count)

    # -------------------------------------------------------------------------
    # 8. Combined Filters
    # -------------------------------------------------------------------------
    def test_08_combined_filters(self):
        # Segment + KYC Status: RETAIL + PARTIAL -> 47 customers
        resp = self.client.get("/api/customers?segment=RETAIL&kyc_status=PARTIAL&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 47)

        # Segment + KYC Status: RETAIL + PENDING -> 26 customers
        resp = self.client.get("/api/customers?segment=RETAIL&kyc_status=PENDING&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 26)

        # Segment + KYC Status: RETAIL + FULL -> 0 customers (genuinely zero in dataset)
        resp = self.client.get("/api/customers?segment=RETAIL&kyc_status=FULL&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 0)

        # Segment + KYC Status: SME + FULL -> 19 customers
        resp = self.client.get("/api/customers?segment=SME&kyc_status=FULL&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 19)

        # Segment + KYC Status: VIP + FULL -> 4 customers
        resp = self.client.get("/api/customers?segment=VIP&kyc_status=FULL&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 4)

        # Segment + Risk Category: RETAIL + LOW -> 58 customers
        resp = self.client.get("/api/customers?segment=RETAIL&risk_category=LOW&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 58)

        # Segment + Risk Category: RETAIL + HIGH -> 3 customers
        resp = self.client.get("/api/customers?segment=RETAIL&risk_category=HIGH&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 3)

        # KYC Status + Risk Category: PARTIAL + MEDIUM -> 10 customers
        resp = self.client.get("/api/customers?kyc_status=PARTIAL&risk_category=MEDIUM&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 10)

        # KYC Status + Risk Category: FULL + HIGH -> 6 customers
        resp = self.client.get("/api/customers?kyc_status=FULL&risk_category=HIGH&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 6)

        # Segment + Registered City: RETAIL + Kinshasa -> 34 customers
        resp = self.client.get("/api/customers?segment=RETAIL&city=Kinshasa&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 34)

        # KYC Status + Registered City: FULL + Kinshasa -> 14 customers
        resp = self.client.get("/api/customers?kyc_status=FULL&city=Kinshasa&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 14)

        # KYC Status + Registered City: PARTIAL + Kinshasa -> 23 customers
        resp = self.client.get("/api/customers?kyc_status=PARTIAL&city=Kinshasa&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 23)

        # Risk Category + Registered City: HIGH + Kinshasa -> 4 customers
        resp = self.client.get("/api/customers?risk_category=HIGH&city=Kinshasa&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 4)

        # All applicable filters together: RETAIL + PARTIAL + LOW + Kinshasa -> 15 customers
        resp = self.client.get("/api/customers?segment=RETAIL&kyc_status=PARTIAL&risk_category=LOW&city=Kinshasa&page_size=100")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["pagination"]["total"], 15)
        for item in resp.json()["items"]:
            self.assertEqual(item["customer_segment"], "Retail")
            self.assertEqual(item["kyc_status"], "Tier_2_Standard")
            self.assertEqual(item["risk_category"], "Low")
            self.assertEqual(item["registered_city"], "Kinshasa")

    # -------------------------------------------------------------------------
    # 9. Reset Filters
    # -------------------------------------------------------------------------
    def test_09_reset_filters(self):
        # 1. First run a filtered query
        filtered_resp = self.client.get("/api/customers?segment=RETAIL&kyc_status=PARTIAL&risk_category=LOW&city=Kinshasa")
        self.assertEqual(filtered_resp.status_code, 200)
        self.assertEqual(filtered_resp.json()["pagination"]["total"], 15)

        # 2. Reset filters (unfiltered request)
        reset_resp = self.client.get("/api/customers?page=1&page_size=15")
        self.assertEqual(reset_resp.status_code, 200)
        self.assertEqual(reset_resp.json()["pagination"]["total"], 120)
        self.assertEqual(len(reset_resp.json()["items"]), 15)


if __name__ == "__main__":
    unittest.main()

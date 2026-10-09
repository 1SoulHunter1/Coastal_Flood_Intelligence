"""
CoastGuard-AI: Pydantic v2 Schemas
Guarantees strict schema parity with TypeScript interfaces in frontend/src/types/
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union, Literal

# -------------------------------------------------------------
# 1. Environment Conditions
# -------------------------------------------------------------
class EnvironmentConditions(BaseModel):
    observed_rainfall_rate_mm_hr: float
    rainfall_24h_total_mm: float
    rainfall_status: Literal['RISING', 'STEADY', 'RECEDING']
    tide_level_m: float
    tide_status: Literal['HIGH TIDE', 'LOW TIDE', 'SLACK TIDE', 'EBB TIDE']
    storm_surge_m: float
    wind_speed_kmh: float
    wind_direction: str
    river_discharge_m3s: float
    weather_source: str
    marine_source: str
    river_source: str
    feed_timestamp_ist: str

# -------------------------------------------------------------
# 2. Zone Intelligence
# -------------------------------------------------------------
class RiskDriverFactor(BaseModel):
    factor: str
    percentage: float
    impact_description: Optional[str] = None

class EstimatedImpact(BaseModel):
    buildings: int
    road_segments: int
    critical_facilities: int
    schools: Optional[int] = None
    shelters: int = 2
    hospitals: int = 1

class ZoneData(BaseModel):
    zone_id: str
    zone_name: str
    risk_level: Literal['CRITICAL', 'HIGH', 'MODERATE', 'LOW']
    flood_probability: int
    severity: Literal['CRITICAL', 'HIGH', 'MODERATE', 'LOW']
    expected_onset: str
    expected_peak: str
    risk_drivers: List[RiskDriverFactor]
    estimated_population: int
    affected_buildings: int
    affected_roads: int
    critical_facilities: int
    population_at_risk: Optional[int] = None
    estimated_impact: Optional[EstimatedImpact] = None
    elevation_avg_m: float
    coordinates: List[List[float]]
    center: List[float]
    priority_rank: int
    priority_status: Literal['IMMEDIATE', 'URGENT', 'HIGH', 'MONITOR', 'LOW']
    priority_score: float
    drainage_capacity_rating: Literal['ADEQUATE', 'STRESSED', 'SEVERELY CONGESTED']
    key_observation: str
    # Real-time physical prediction extensions
    predicted_depth_m: Optional[float] = None
    depth_q10_m: Optional[float] = None
    depth_q50_m: Optional[float] = None
    depth_q90_m: Optional[float] = None
    road_access_status: Optional[str] = None
    facility_access_status: Optional[str] = None
    nearest_shelter_text: Optional[str] = None

class ZoneSummaryResponse(BaseModel):
    zones: List[ZoneData]
    highRiskZonesCount: int
    totalPopulationAtRisk: int
    overallSystemRisk: str

# -------------------------------------------------------------
# 3. Forecast Timeline
# -------------------------------------------------------------
class ForecastPoint(BaseModel):
    time_label: str
    timestamp: str
    flood_probability: int
    rainfall_rate_mm_hr: float
    tide_level_m: float
    storm_surge_m: Optional[float] = None
    is_onset: Optional[bool] = False
    is_peak: Optional[bool] = False
    notes: Optional[str] = None

# -------------------------------------------------------------
# 4. Critical Infrastructure & Roads
# -------------------------------------------------------------
class InfrastructureSummary(BaseModel):
    hospitals_at_risk: int
    schools_at_risk: Optional[int] = None
    shelters_active: int
    road_segments_affected: int
    buildings_affected: int
    critical_facilities_at_risk: int

class CriticalFacility(BaseModel):
    id: str
    name: str
    type: Literal['HOSPITAL', 'SHELTER', 'FIRE_STATION', 'POLICE_STATION', 'POWER_STATION', 'DRAIN_PUMP', 'GOV_CENTER', 'PORT']
    zone_id: str
    zone_name: str
    status: Literal['OPERATIONAL', 'AT_RISK', 'CRITICAL', 'STANDBY', 'UNKNOWN']
    coordinates: List[float]
    capacity_or_load: Optional[str] = None
    contact: Optional[str] = None
    elevation_m: float

class RoadSegment(BaseModel):
    id: str
    name: str
    category: Literal['NH-66', 'STATE_HIGHWAY', 'ARTERIAL', 'BRIDGE_CORRIDOR']
    zone_id: str
    zone_name: str
    status: Literal['PASSABLE', 'WATERLOGGED', 'INUNDATED', 'CLOSED']
    water_depth_cm: int
    coordinates: List[List[float]]

class InfrastructureResponse(BaseModel):
    summary: InfrastructureSummary
    facilities: List[CriticalFacility]
    roads: List[RoadSegment]

# -------------------------------------------------------------
# 5. Routing & Access
# -------------------------------------------------------------
class RoadImpactItem(BaseModel):
    id: str
    name: str
    zone_id: str
    zone_name: str
    category: Literal['NH-66', 'STATE_HIGHWAY', 'ARTERIAL', 'BRIDGE_CORRIDOR']
    predicted_depth_m: float
    water_depth_cm: int
    status: Literal['OPEN', 'AT_RISK', 'CLOSED']
    closure_reason: Optional[str] = None
    predicted_closure_time: Optional[str] = None
    coordinates: List[List[float]]
    alternative_route_available: bool
    alternative_route_id: Optional[str] = None

class PrimaryRouteInfo(BaseModel):
    name: str
    corridor: str
    status: Literal['OPEN', 'AT_RISK', 'CLOSED']
    closure_time: Optional[str] = None

class AlternativeRouteInfo(BaseModel):
    name: str
    corridor: str
    status: Literal['OPEN']
    detour_minutes: int
    travel_time_minutes: int
    route_id: str
    coordinates: Optional[List[List[float]]] = None

class HospitalAccessibility(BaseModel):
    id: str
    name: str
    zone_id: str
    zone_name: str
    facility_flood_status: Literal['DRY', 'WATERLOGGED', 'INUNDATED']
    access_status: Literal['OPEN', 'AT_RISK', 'CLOSED']
    reason: str
    primary_route: PrimaryRouteInfo
    alternative_route: Optional[AlternativeRouteInfo] = None
    contact: str
    coordinates: List[float]

class ShelterAccessibility(BaseModel):
    id: str
    name: str
    zone_id: str
    zone_name: str
    capacity: int
    occupied: Optional[int] = 0
    flood_status: Literal['DRY', 'WATERLOGGED']
    road_accessibility: Literal['OPEN', 'AT_RISK', 'CLOSED']
    distance_km: float
    travel_time_minutes: int
    route_status: Literal['OPEN ACCESS', 'NOT ACCESSIBLE', 'RESTRICTED']
    is_recommended: bool
    route_id: Optional[str] = None
    coordinates: List[float]

class EmergencyRoute(BaseModel):
    id: str
    name: str
    type: Literal['PRIMARY', 'ALTERNATIVE']
    status: Literal['OPEN', 'CLOSED', 'AT_RISK']
    origin: str
    destination: str
    destination_type: Literal['HOSPITAL', 'SHELTER', 'EVACUATION_POINT']
    detour_minutes: Optional[int] = None
    travel_time_minutes: int
    distance_km: float
    closure_time: Optional[str] = None
    corridor: str
    coordinates: List[List[float]]
    associated_zone_id: str
    notes: Optional[str] = None

class SystemAccessSummary(BaseModel):
    roads_closed_count: int
    roads_at_risk_count: int
    hospitals_accessible_ratio: str
    shelters_reachable_ratio: str
    critical_facilities_count: int
    access_status_headline: str

# -------------------------------------------------------------
# 6. Counterfactual / What-If Analysis
# -------------------------------------------------------------
class CounterfactualInputs(BaseModel):
    zone_id: Optional[str] = 'Zone 03'
    study_area: Optional[str] = 'mangaluru'
    tide_offset_m: float = -0.40
    rainfall_percent_change: float = 0.0
    rainfall_offset_mm_hr: float = 0.0
    storm_surge_offset_m: float = 0.0

class CounterfactualState(BaseModel):
    tide_m: float
    rainfall_rate_mm_hr: float
    storm_surge_m: float
    predicted_depth_m: float
    depth_q10_m: Optional[float] = None
    depth_q90_m: Optional[float] = None
    risk_level: str
    probability: int

class CounterfactualScenario(BaseModel):
    zone_id: str
    baseline: CounterfactualState
    simulated: CounterfactualState
    depth_delta_m: float
    depth_q90_delta_m: Optional[float] = None
    risk_shift: str
    explanation: str

# -------------------------------------------------------------
# 7. Emergency Response, Priority & Briefings
# -------------------------------------------------------------
class EmergencyPriorityItem(BaseModel):
    rank: int
    zone_id: str
    zone_name: str
    risk_level: str
    exposure: str
    critical_facilities: int
    priority: str
    priority_score: float
    rationale: str

class ResponderActionItem(BaseModel):
    category: Literal['IMMEDIATE', 'TRAFFIC CONTROL', 'ROUTE MANAGEMENT', 'CRITICAL FACILITY', 'MONITORING']
    action: str
    target_location: str
    timing: Optional[str] = None
    priority: Literal['HIGH', 'URGENT', 'STANDARD']

class ResponderBriefing(BaseModel):
    zone_id: str
    zone_name: str
    headline: str
    risk_level: str
    expected_onset: str
    expected_peak: str
    roads_affected_count: int
    roads_closed_count: int
    critical_facilities_at_risk_count: int
    key_actions: List[str]
    responder_actions: List[ResponderActionItem]
    generated_timestamp: str

class SituationBriefData(BaseModel):
    title: str
    bulletin_number: str
    timestamp_ist: str
    headline: str
    narrative_paragraph_1: str
    narrative_paragraph_2: str
    recommended_primary_zone: str
    key_meteorological_trigger: str
    prepared_by: str

# -------------------------------------------------------------
# 8. Alerts
# -------------------------------------------------------------
class AlertItem(BaseModel):
    id: str
    zone_id: str
    zone_name: str
    risk_level: Literal['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'INFO']
    title: str
    description: str
    issued_at: str
    expires_at: str
    status: Literal['ACTIVE', 'ESCALATED', 'MONITORING', 'STANDBY']
    recommended_actions: List[str]
    affected_facilities: List[str]

class AlertLanguageContent(BaseModel):
    title: str
    body: str
    advisory: str
    sms_text: str
    whatsapp_text: str

class PublicAlertTemplate(BaseModel):
    zone_id: str
    zone_name: str
    risk_level: str
    expected_onset: str
    expected_peak: str
    nearest_shelter_name: str
    nearest_shelter_distance_km: float
    english: AlertLanguageContent
    kannada: AlertLanguageContent

# -------------------------------------------------------------
# 9. Blueprint Direct Endpoints (for User's REST blueprint)
# -------------------------------------------------------------
class OperationalSummary(BaseModel):
    region: str
    timestamp: str
    observed_rainfall_mm_hr: float
    tide_level_msl_m: float
    storm_surge_m: float
    wind_speed_kmh: float
    river_discharge_m3_s: float
    status: str

class ZoneAnalysisResponse(BaseModel):
    zone_id: str
    risk_classification: str
    predictions: Dict[str, float]
    onset_time: str
    expected_peak: str
    road_access_status: str
    population: int
    building_count: int
    facility_access: List[Dict[str, Any]]
    shap_attribution: Dict[str, float]

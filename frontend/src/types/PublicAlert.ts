export interface PublicAlertTemplate {
  zone_id: string;
  zone_name: string;
  risk_level: string;
  expected_onset: string;
  expected_peak: string;
  nearest_shelter_name: string;
  nearest_shelter_distance_km: number;
  english: {
    title: string;
    body: string;
    advisory: string;
    sms_text: string;
    whatsapp_text: string;
  };
  kannada: {
    title: string;
    body: string;
    advisory: string;
    sms_text: string;
    whatsapp_text: string;
  };
}

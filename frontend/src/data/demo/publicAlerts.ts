import type { PublicAlertTemplate } from '../../types/PublicAlert';

export const demoPublicAlerts: Record<string, PublicAlertTemplate> = {
  'Zone 03': {
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    risk_level: 'HIGH',
    expected_onset: '18:40 IST',
    expected_peak: '22:15 IST',
    nearest_shelter_name: 'Shelter A (St. Antony Memorial Community Shelter)',
    nearest_shelter_distance_km: 2.4,
    english: {
      title: 'FLOOD WARNING — MANGALURU',
      body:
        'Zone: Zone 03 — Kulur\n' +
        'Risk: HIGH (82% Probability)\n' +
        'Expected onset: 18:40 IST | Expected peak: 22:15 IST\n\n' +
        'Predicted flood depth exceeds 0.30 m on Main Road 760 and river approaches. ' +
        'Residents in low-lying areas should move toward the nearest identified dry shelter and avoid flooded roads.\n\n' +
        'Nearest reachable shelter:\n' +
        'Shelter A (St. Antony Memorial Shelter) — 2.4 km via elevated ridge route.',
      advisory: 'Avoid walking or driving through water. Sluice backflow is active.',
      sms_text:
        '[SIMULATION ALERT] MANGALURU FLOOD WARNING: Zone 03 Kulur at HIGH risk. Onset 18:40 IST. Peak 22:15 IST. Avoid Main Road 760. Evacuate to Shelter A (2.4km, Open Access). Emergency: 1077.',
      whatsapp_text:
        '🚨 *MANGALURU COASTAL FLOOD ADVISORY (SIMULATION)*\n\n' +
        '📍 *Zone:* Zone 03 — Kulur\n' +
        '⚠️ *Risk Level:* HIGH (Predicted Depth: 0.35 m)\n' +
        '⏱ *Expected Onset:* 18:40 IST\n' +
        '🌊 *Expected Peak:* 22:15 IST\n\n' +
        '🚫 *Road Closure:* Main Road 760 is CLOSED (water depth > 0.30 m).\n' +
        '🏥 *Hospital Access:* Wenlock Hospital reachable via Bendoorwell alternative detour (+8 min).\n' +
        '🏠 *Nearest Safe Shelter:* Shelter A (St. Antony Memorial) — 2.4 km (OPEN ACCESS).\n\n' +
        '📞 *District Emergency Operations Centre:* 1077 / 112\n' +
        '_CoastGuard-AI Simulation Platform • DDMA Mangaluru_'
    },
    kannada: {
      title: 'ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಮಂಗಳೂರು',
      body:
        'ವಲಯ: ಕುಲೂರು (Zone 03)\n' +
        'ಅಪಾಯ ಮಟ್ಟ: ಹೆಚ್ಚು (೮೨% ಸಂಭವನೀಯತೆ)\n' +
        'ನಿರೀಕ್ಷಿತ ಆರಂಭ: ಸಂಜೆ ೬:೪೦ IST | ನಿರೀಕ್ಷಿತ ಗರಿಷ್ಠ: ರಾತ್ರಿ ೧೦:೧೫ IST\n\n' +
        'ಮುಖ್ಯ ರಸ್ತೆ ೭೬೦ ಮತ್ತು ನದಿ ದಂಡೆಯ ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರಿನ ಆಳ ೦.೩೦ ಮೀಟರ್ ಮೀರಿದೆ. ' +
        'ತಗ್ಗು ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಲು ಸೂಚಿಸಲಾಗಿದೆ. ನೀರು ತುಂಬಿದ ರಸ್ತೆಗಳಲ್ಲಿ ಸಂಚರಿಸಬೇಡಿ.\n\n' +
        'ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ:\n' +
        'ಶೆಲ್ಟರ್ ಎ (ಸೈಂಟ್ ಆಂಟನಿ ಸ್ಮಾರಕ ಭವನ) — ೨.೪ ಕಿ.ಮೀ (ರಸ್ತೆ ಮುಕ್ತವಾಗಿದೆ).',
      advisory: 'ನೀರು ತುಂಬಿರುವ ರಸ್ತೆಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಬೇಡಿ. ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಿ.',
      sms_text:
        '[ಸಿಮ್ಯುಲೇಶನ್ ಎಚ್ಚರಿಕೆ] ಮಂಗಳೂರು ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ: ಕುಲೂರು ವಲಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯ. ಆರಂಭ ಸಂಜೆ ೬:೪೦. ರಸ್ತೆ ೭೬೦ ಬಂದ್ ಆಗಿದೆ. ಸುರಕ್ಷಿತ ಆಶ್ರಯ: ಶೆಲ್ಟರ್ ಎ (೨.೪ ಕಿ.ಮೀ). ತುರ್ತು ಸಹಾಯವಾಣಿ: ೧೦೭೭.',
      whatsapp_text:
        '🚨 *ಮಂಗಳೂರು ಕರಾವಳಿ ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ (ಸಿಮ್ಯುಲೇಶನ್)*\n\n' +
        '📍 *ವಲಯ:* ಕುಲೂರು (Zone 03)\n' +
        '⚠️ *ಅಪಾಯ ಮಟ್ಟ:* ಹೆಚ್ಚು (ಅಂದಾಜು ನೀರಿನ ಆಳ: ೦.೩೫ ಮೀ)\n' +
        '⏱ *ನಿರೀಕ್ಷಿತ ಆರಂಭ:* ಸಂಜೆ ೬:೪೦ IST\n' +
        '🌊 *ನಿರೀಕ್ಷಿತ ಗರಿಷ್ಠ ಮಟ್ಟ:* ರಾತ್ರಿ ೧೦:೧೫ IST\n\n' +
        '🚫 *ರಸ್ತೆ ಮುಚ್ಚುಗಡೆ:* ಮುಖ್ಯ ರಸ್ತೆ ೭೬೦ ಸಂಚಾರಕ್ಕೆ ಮುಚ್ಚಲಾಗಿದೆ (ನೀರಿನ ಆಳ > ೦.೩೦ ಮೀ).\n' +
        '🏥 *ಆಸ್ಪತ್ರೆ ಮಾರ್ಗ:* ವೆನ್ಲಾಕ್ ಆಸ್ಪತ್ರೆಗೆ ಬೆಂದೂರ್‌ವೆಲ್ ಪರ್ಯಾಯ ಮಾರ್ಗ ಮುಕ್ತವಾಗಿದೆ (+೮ ನಿಮಿಷ).\n' +
        '🏠 *ಹತ್ತಿರದ ಆಶ್ರಯ ತಾಣ:* ಶೆಲ್ಟರ್ ಎ (ಸೈಂಟ್ ಆಂಟನಿ ಭವನ) — ೨.೪ ಕಿ.ಮೀ (ತೆರೆದಿದೆ).\n\n' +
        '📞 *ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಕೋಶ:* ೧೦೭೭ / ೧೧೨\n' +
        '_ಕೋಸ್ಟ್‌ಗಾರ್ಡ್-ಎಐ ಸಿಮ್ಯುಲೇಶನ್ • ಡಿಡಿಎಂಎ ಮಂಗಳೂರು_'
    }
  }
};

export const getPublicAlertForZone = (zoneId: string): PublicAlertTemplate => {
  return demoPublicAlerts[zoneId] || demoPublicAlerts['Zone 03'];
};

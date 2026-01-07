const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pozzeqqljpzpkhhtrxss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvenplcXFsanB6cGtoaHRyeHNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzczNTUxNCwiZXhwIjoyMDgzMzExNTE0fQ.N2usAO7ZHxVNB7ujTcyZECDS5cXzscg_RE0QO_Pt7Lo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database...');

  // Insert seed data
  const entities = [
    {
      company_name: 'Apex Ventures LLC',
      home_state: 'Delaware',
      states_qualified: ['California', 'New York', 'Texas', 'Florida', 'Nevada'],
      next_compliance_date: '2026-02-15'
    },
    {
      company_name: 'Silverstone Holdings Inc',
      home_state: 'Texas',
      states_qualified: ['Delaware', 'Arizona', 'Colorado', 'Georgia', 'Illinois'],
      next_compliance_date: '2026-03-22'
    },
    {
      company_name: 'BlueSky Technologies Corp',
      home_state: 'Delaware',
      states_qualified: ['Washington', 'Oregon', 'Massachusetts', 'Virginia', 'Maryland'],
      next_compliance_date: '2026-01-28'
    },
    {
      company_name: 'Meridian Capital Partners',
      home_state: 'Delaware',
      states_qualified: ['New York', 'New Jersey', 'Connecticut', 'Pennsylvania', 'Ohio'],
      next_compliance_date: '2026-04-10'
    },
    {
      company_name: 'Phoenix Investments Group',
      home_state: 'Texas',
      states_qualified: ['California', 'Nevada', 'Utah', 'New Mexico', 'Oklahoma'],
      next_compliance_date: '2026-02-05'
    },
    {
      company_name: 'Quantum Industries LLC',
      home_state: 'Delaware',
      states_qualified: ['Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Missouri'],
      next_compliance_date: '2026-05-18'
    },
    {
      company_name: 'Horizon Global Solutions',
      home_state: 'Texas',
      states_qualified: ['North Carolina', 'South Carolina', 'Tennessee', 'Alabama', 'Louisiana'],
      next_compliance_date: '2026-03-07'
    },
    {
      company_name: 'Pinnacle Equity Corp',
      home_state: 'Delaware',
      states_qualified: ['California', 'Texas', 'Florida', 'Illinois', 'Ohio'],
      next_compliance_date: '2026-06-14'
    },
    {
      company_name: 'Catalyst Enterprises Inc',
      home_state: 'Delaware',
      states_qualified: ['Georgia', 'Virginia', 'Colorado', 'Arizona', 'Washington'],
      next_compliance_date: '2026-01-30'
    },
    {
      company_name: 'Summit Strategic Holdings',
      home_state: 'Texas',
      states_qualified: ['New York', 'Massachusetts', 'Pennsylvania', 'New Jersey', 'Maryland'],
      next_compliance_date: '2026-04-25'
    }
  ];

  const { data, error } = await supabase
    .from('entities')
    .insert(entities);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Successfully inserted 10 entities!');
    console.log('Data:', data);
  }
}

setupDatabase();

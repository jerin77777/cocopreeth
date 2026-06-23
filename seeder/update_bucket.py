import os
import sys
import psycopg2

def main():
    # Load env
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(current_dir, '..', 'client', '.env')
    
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                env_vars[key.strip()] = val.strip()
                
    supabase_url = env_vars.get('VITE_SUPABASE_URL')
    supabase_pwd = env_vars.get('supabase_pwd')
    
    project_ref = supabase_url.replace('https://', '').split('.')[0]
    db_host = f"db.{project_ref}.supabase.co"
    
    print("Connecting to DB...")
    conn = psycopg2.connect(
        host=db_host,
        database="postgres",
        user="postgres",
        password=supabase_pwd,
        port=5432
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Updating bucket public to true...")
    cursor.execute("UPDATE storage.buckets SET public = true WHERE id = 'images';")
    print("Successfully updated!")
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()

import os
import sys
import json
import subprocess

def install_dependencies():
    """Ensure psycopg2-binary is installed for PostgreSQL connection."""
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 not found. Installing psycopg2-binary...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
            print("Successfully installed psycopg2-binary.")
        except Exception as e:
            print(f"Failed to install psycopg2-binary: {e}")
            print("Please run: pip install psycopg2-binary")
            sys.exit(1)

# Ensure dependencies are available
install_dependencies()
import psycopg2
from psycopg2.extras import Json

def load_env(env_path):
    """Load environment variables from the given file path."""
    env_vars = {}
    if not os.path.exists(env_path):
        print(f"Error: .env file not found at {env_path}")
        return env_vars
    
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                env_vars[key.strip()] = val.strip()
    return env_vars

def main():
    # Path to client's .env
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(current_dir, '..', 'client', '.env')
    
    print(f"Loading environment variables from {env_path}...")
    env_vars = load_env(env_path)
    
    supabase_url = env_vars.get('VITE_SUPABASE_URL')
    supabase_pwd = env_vars.get('supabase_pwd')
    
    if not supabase_url or not supabase_pwd:
        print("Error: VITE_SUPABASE_URL or supabase_pwd not found in .env")
        sys.exit(1)
        
    # Extract project ref from supabase url
    project_ref = supabase_url.replace('https://', '').split('.')[0]
    db_host = f"db.{project_ref}.supabase.co"
    
    print(f"Database host: {db_host}")
    print("Connecting to Supabase PostgreSQL database...")
    
    try:
        conn = psycopg2.connect(
            host=db_host,
            database="postgres",
            user="postgres",
            password=supabase_pwd,
            port=5432
        )
        conn.autocommit = True
        cursor = conn.cursor()
        print("Connected successfully!")
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)
        
    # 1. Read and execute schema.sql
    schema_path = os.path.join(current_dir, 'schema.sql')
    if os.path.exists(schema_path):
        print("Applying SQL Schema...")
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        try:
            cursor.execute(schema_sql)
            print("SQL Schema applied successfully!")
        except Exception as e:
            print(f"Failed to apply schema: {e}")
            conn.close()
            sys.exit(1)
    else:
        print("Warning: schema.sql not found in the seeder directory.")

    # 1.5. Ensure storage bucket 'images' exists and is public
    print("Setting up storage bucket 'images'...")
    try:
        cursor.execute("""
            INSERT INTO storage.buckets (id, name, public) 
            VALUES ('images', 'images', true) 
            ON CONFLICT (id) DO UPDATE SET public = true;
        """)
        print("Bucket 'images' ensured successfully!")
    except Exception as e:
        print(f"Failed to ensure bucket: {e}")

    # Set up RLS policies on storage.objects for public read/write access
    policies = [
        ("Public Select", "CREATE POLICY \"Public Select\" ON storage.objects FOR SELECT USING (bucket_id = 'images');"),
        ("Public Insert", "CREATE POLICY \"Public Insert\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');"),
        ("Public Update", "CREATE POLICY \"Public Update\" ON storage.objects FOR UPDATE USING (bucket_id = 'images');"),
        ("Public Delete", "CREATE POLICY \"Public Delete\" ON storage.objects FOR DELETE USING (bucket_id = 'images');")
    ]
    for name, sql in policies:
        try:
            cursor.execute(f"DROP POLICY IF EXISTS \"{name}\" ON storage.objects;")
            cursor.execute(sql)
            print(f"Storage policy '{name}' configured successfully!")
        except Exception as e:
            print(f"Failed to configure storage policy '{name}': {e}")

    # 2. Upload images to storage
    import urllib.request
    import mimetypes
    print("Uploading local images to Supabase storage bucket...")
    seeder_images_dir = os.path.join(current_dir, 'images')
    uploaded_images = {}
    
    if os.path.exists(seeder_images_dir):
        for filename in os.listdir(seeder_images_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
                local_file_path = os.path.join(seeder_images_dir, filename)
                print(f"Uploading {filename}...")
                
                url = f"{supabase_url}/storage/v1/object/images/{filename}"
                mime_type, _ = mimetypes.guess_type(local_file_path)
                if not mime_type:
                    mime_type = 'application/octet-stream'
                
                try:
                    with open(local_file_path, 'rb') as f:
                        file_data = f.read()
                    
                    headers = {
                        'Authorization': f'Bearer {env_vars.get("VITE_SUPABASE_ANON_KEY")}',
                        'apiKey': env_vars.get("VITE_SUPABASE_ANON_KEY"),
                        'Content-Type': mime_type,
                        'x-upsert': 'true'
                    }
                    
                    req = urllib.request.Request(url, data=file_data, headers=headers, method='POST')
                    with urllib.request.urlopen(req) as response:
                        response.read()
                    
                    # Store public URL
                    public_url = f"{supabase_url}/storage/v1/object/public/images/{filename}"
                    uploaded_images[filename] = public_url
                    print(f"Successfully uploaded {filename}. URL: {public_url}")
                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")
                    # Fallback
                    public_url = f"{supabase_url}/storage/v1/object/public/images/{filename}"
                    uploaded_images[filename] = public_url
    else:
        print(f"Warning: Seeder images directory not found at {seeder_images_dir}")

    # 3. Define default website settings
    # helper to get image URL
    def get_img_url(name, default_path):
        return uploaded_images.get(name, f"{supabase_url}/storage/v1/object/public/images/{name}")
        
    default_settings = {
        "hero_title": "Escape. Relax. Reconnect.",
        "hero_desc": "Experience the perfect blend of nature, comfort and tranquility at COCO Preeth farmhouse. Slow down, breathe the clean air, and rediscover rural serenity.",
        "about_subtitle": "About Us",
        "about_title": "A Farm House Like No Other",
        "about_text": "At COCO Preeth Farm House, we offer more than just a getaway. It's a sanctuary where you can escape the noise of city life, breathe pure mountain air, and engage with the peaceful rhythms of agricultural life. Whether you are strolling in our organic plantation, reading on our scenic terrace, or tasting pure farm-fresh ingredients, COCO Preeth is where lasting memories are grown.",
        "hero_bg": get_img_url("hero_background.png", "/images/hero_background.png"),
        "about_terrace": get_img_url("about_terrace.png", "/images/about_terrace.png"),
        "experiences": [
            {
                "id": 1,
                "title": "Barbecue & Camp Fire",
                "desc": "Delicious barbecue, cozy conversations and warm campfire nights.",
                "bgImage": get_img_url("activity_barbecue.png", "/images/activity_barbecue.png")
            },
            {
                "id": 2,
                "title": "Mountain Biking",
                "desc": "Hit the trails and feel the thrill of mountain biking through scenic routes.",
                "bgImage": get_img_url("activity_biking.png", "/images/activity_biking.png")
            },
            {
                "id": 3,
                "title": "Plantation Tour",
                "desc": "Explore our lush organic plantations and learn about sustainable farming.",
                "bgImage": get_img_url("activity_plantation.png", "/images/activity_plantation.png")
            },
            {
                "id": 4,
                "title": "Nature Walks",
                "desc": "Discover local wildlife and bird species on guided walking trails.",
                "bgImage": get_img_url("activity_nature_walk.png", "/images/activity_nature_walk.png")
            }
        ],
        "gallery": [
            {
                "id": 1,
                "img": get_img_url("gallery_farmhouse.png", "/images/gallery_farmhouse.png"),
                "caption": "The Main House",
                "sub": "Rustic Architecture"
            },
            {
                "id": 2,
                "img": get_img_url("gallery_farming.png", "/images/gallery_farming.png"),
                "caption": "Organic Produce",
                "sub": "Farm to Table"
            },
            {
                "id": 3,
                "img": get_img_url("gallery_bedroom.png", "/images/gallery_bedroom.png"),
                "caption": "Comfortable Rooms",
                "sub": "Modern Cozy Stay"
            },
            {
                "id": 4,
                "img": get_img_url("gallery_tea.png", "/images/gallery_tea.png"),
                "caption": "Sunrise Breakfast",
                "sub": "Scenic Dining"
            },
            {
                "id": 5,
                "img": get_img_url("gallery_horse.png", "/images/gallery_horse.png"),
                "caption": "Meadow Companions",
                "sub": "Horse Stable"
            }
        ]
    }

    # 4. Seed data
    print("Inserting seed projects...")
    
    seed_projects = [
        {
            "name": "COCO Preeth Farmhouse Portal",
            "structure": {
                "name": "COCO Preeth Farmhouse Portal",
                "version": "1.0.0",
                "settings": default_settings,
                "root": {
                    "type": "directory",
                    "name": "root",
                    "children": [
                        {
                            "type": "directory",
                            "name": "src",
                            "children": [
                                {
                                    "type": "file",
                                    "name": "App.tsx",
                                    "content": "import React from 'react';\n\nexport default function App() {\n  return (\n    <div className='p-6'>\n      <h1>Welcome to COCO Preeth Farmhouse</h1>\n    </div>\n  );\n}"
                                },
                                {
                                    "type": "file",
                                    "name": "index.css",
                                    "content": "body { margin: 0; background: #f4f6f4; color: #2d3748; }"
                                }
                            ]
                        },
                        {
                            "type": "directory",
                            "name": "public",
                            "children": [
                                {
                                    "type": "file",
                                    "name": "index.html",
                                    "content": "<!DOCTYPE html>\n<html>\n<head>\n  <title>COCO Preeth</title>\n</head>\n<body>\n  <div id='root'></div>\n</body>\n</html>"
                                }
                            ]
                        },
                        {
                            "type": "file",
                            "name": "package.json",
                            "content": "{\n  \"name\": \"cocopreeth-portal\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^19.0.0\"\n  }\n}"
                        }
                    ]
                }
            }
        },
        {
            "name": "E-Commerce Backend",
            "structure": {
                "name": "E-Commerce Backend",
                "version": "0.1.0",
                "root": {
                    "type": "directory",
                    "name": "root",
                    "children": [
                        {
                            "type": "directory",
                            "name": "app",
                            "children": [
                                {
                                    "type": "file",
                                    "name": "main.py",
                                    "content": "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/')\ndef read_root():\n    return {'status': 'healthy'}"
                                },
                                {
                                    "type": "file",
                                    "name": "config.py",
                                    "content": "import os\n\nDATABASE_URL = os.getenv('DATABASE_URL')"
                                }
                            ]
                        },
                        {
                            "type": "file",
                            "name": "requirements.txt",
                            "content": "fastapi>=0.100.0\nuvicorn>=0.22.0\nsqlalchemy>=2.0.0"
                        },
                        {
                            "type": "file",
                            "name": "Dockerfile",
                            "content": "FROM python:3.11\nWORKDIR /code\nCOPY ./requirements.txt /code/requirements.txt\nRUN pip install --no-cache-dir --upgrade -r /code/requirements.txt\nCOPY ./app /code/app\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"80\"]"
                        }
                    ]
                }
            }
        }
    ]

    for proj in seed_projects:
        try:
            # Insert or update if exists
            cursor.execute(
                """
                INSERT INTO projects (name, structure)
                VALUES (%s, %s)
                ON CONFLICT (name) DO UPDATE
                SET structure = EXCLUDED.structure,
                    updated_at = TIMEZONE('utc'::text, NOW())
                """,
                (proj["name"], Json(proj["structure"]))
            )
            print(f"Successfully seeded project: {proj['name']}")
        except Exception as e:
            print(f"Failed to seed project {proj['name']}: {e}")
            
    cursor.close()
    conn.close()
    print("Database seeding completed!")

if __name__ == "__main__":
    main()

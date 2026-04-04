from app.db.database import SessionLocal
from app.models.hub import HubCategory, HubLink

def seed_data():
    db = SessionLocal()
    
    # Eğer veritabanı zaten doluysa işlemi durdur
    if db.query(HubCategory).first():
        print("Database is already seeded. Skipping...")
        db.close()
        return

    # Başlangıç Verilerimiz
    hub_data = [
        {
            "id": "website-metrics", "title": "Website Metrics", "icon": "LayoutDashboard", "color": "bg-blue-500",
            "links": [
                {"name": "Overall Metrics", "url": "/analytics/overall"},
                {"name": "US Metrics", "url": "/analytics/us"},
                {"name": "Google Ads Metrics", "url": "/analytics/ads"},
                {"name": "Software Review Metrics", "url": "/analytics/software-review"},
                {"name": "GEO Metrics", "url": "/analytics/geo"},
                {"name": "Traffic Details", "url": "/analytics/traffic"},
            ]
        },
        {
            "id": "user-behaviour", "title": "User Behaviour Analytics", "icon": "MousePointerClick", "color": "bg-indigo-500",
            "links": [
                {"name": "Dashboard", "url": "/analytics/behaviour-dashboard"},
                {"name": "Heatmaps", "url": "/analytics/heatmaps"},
                {"name": "User Recordings", "url": "/analytics/recordings"},
            ]
        },
        {
            "id": "seo-analytics", "title": "SEO Analytics", "icon": "Search", "color": "bg-emerald-500",
            "links": [
                {"name": "Google Search Console", "url": "/analytics/gsc"},
                {"name": "Uber Suggest", "url": "/analytics/ubersuggest"},
                {"name": "Backlink", "url": "/analytics/backlinks"},
                {"name": "Keyword Ranking", "url": "/analytics/keywords"},
            ]
        },
        {
            "id": "social-media", "title": "Social Media Metrics", "icon": "Share2", "color": "bg-purple-500",
            "links": [
                {"name": "LinkedIn", "url": "/analytics/linkedin"},
                {"name": "Instagram", "url": "/analytics/instagram"},
                {"name": "Facebook", "url": "/analytics/facebook"},
            ]
        },
        {
            "id": "sales-metrics", "title": "Sales Metrics", "icon": "TrendingUp", "color": "bg-orange-500",
            "links": [
                {"name": "Monthly Performance", "url": "/analytics/sales-monthly"},
                {"name": "Quarterly Review", "url": "/analytics/sales-quarterly"},
            ]
        },
        {
            "id": "webapp-analytics", "title": "Web.App User Behaviour", "icon": "MonitorSmartphone", "color": "bg-cyan-500",
            "links": [
                {"name": "Application Usage", "url": "/analytics/app-usage"},
                {"name": "Feature Adoption", "url": "/analytics/feature-adoption"},
            ]
        }
    ]

    print("Seeding database...")
    for category_data in hub_data:
        # Kategoriyi oluştur
        db_category = HubCategory(
            id=category_data["id"],
            title=category_data["title"],
            icon=category_data["icon"],
            color=category_data["color"]
        )
        db.add(db_category)
        
        # Linkleri oluştur
        for link_data in category_data["links"]:
            db_link = HubLink(
                category_id=category_data["id"],
                name=link_data["name"],
                url=link_data["url"]
            )
            db.add(db_link)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
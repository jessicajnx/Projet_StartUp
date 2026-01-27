from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import auth_routes, user_routes, livre_routes, emprunt_routes, bibliotheque_routes

app = FastAPI(title="Livre2main API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(livre_routes.router)
app.include_router(emprunt_routes.router)
app.include_router(bibliotheque_routes.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Livre2main API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

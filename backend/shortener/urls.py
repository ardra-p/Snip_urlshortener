from django.urls import path
from . import views

urlpatterns = [
    path("api/shorten/", views.shorten_url, name="shorten_url"),
    path("api/urls/", views.list_urls, name="list_urls"),
    # Catch-all MUST stay last: it matches any single path segment as a short code
    path("<str:short_code>/", views.redirect_to_url, name="redirect_to_url"),
]

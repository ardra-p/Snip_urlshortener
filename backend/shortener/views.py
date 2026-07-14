import json
import random
import string

from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from .models import ShortURL

CODE_LENGTH = 6
CODE_CHARS = string.ascii_letters + string.digits


def generate_unique_code():
    """Generate a random short code that doesn't already exist in the DB."""
    while True:
        code = "".join(random.choices(CODE_CHARS, k=CODE_LENGTH))
        if not ShortURL.objects.filter(short_code=code).exists():
            return code


@csrf_exempt  # simplifies calling this from a separately-hosted frontend
@require_http_methods(["POST"])
def shorten_url(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    original_url = data.get("url", "").strip()

    if not original_url:
        return JsonResponse({"error": "Please provide a 'url' field."}, status=400)

    validator = URLValidator()
    try:
        validator(original_url)
    except ValidationError:
        return JsonResponse({"error": "That doesn't look like a valid URL."}, status=400)

    # Reuse an existing short code if this URL was already shortened
    existing = ShortURL.objects.filter(original_url=original_url).first()
    if existing:
        short_url_obj = existing
    else:
        short_url_obj = ShortURL.objects.create(
            original_url=original_url,
            short_code=generate_unique_code(),
        )

    short_link = request.build_absolute_uri(f"/{short_url_obj.short_code}/")

    return JsonResponse(
        {
            "original_url": short_url_obj.original_url,
            "short_code": short_url_obj.short_code,
            "short_url": short_link,
            "clicks": short_url_obj.clicks,
        },
        status=201,
    )


@require_http_methods(["GET"])
def redirect_to_url(request, short_code):
    try:
        entry = ShortURL.objects.get(short_code=short_code)
    except ShortURL.DoesNotExist:
        return JsonResponse({"error": "Short URL not found."}, status=404)

    entry.clicks += 1
    entry.save(update_fields=["clicks"])
    return HttpResponseRedirect(entry.original_url)


@require_http_methods(["GET"])
def list_urls(request):
    """Optional endpoint: list recently created short URLs (for a dashboard)."""
    entries = ShortURL.objects.order_by("-created_at")[:20]
    data = [
        {
            "original_url": e.original_url,
            "short_code": e.short_code,
            "short_url": request.build_absolute_uri(f"/{e.short_code}/"),
            "clicks": e.clicks,
            "created_at": e.created_at.isoformat(),
        }
        for e in entries
    ]
    return JsonResponse({"results": data})

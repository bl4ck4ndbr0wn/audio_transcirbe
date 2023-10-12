from django.urls import include, path
from rest_framework import routers

from .views import FileView

router = routers.DefaultRouter()

router.register(r'files', FileView)

urlpatterns = [
    path(r'', include(router.urls)),
]

from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(prefix='routes', viewset=views.RouteViewSet, basename='route')
router.register(prefix='buses', viewset=views.BusViewSet, basename='bus')
router.register(prefix='feedbacks', viewset=views.FeedbackViewSet, basename='feedback')
router.register(prefix='users', viewset=views.UserViewSet, basename='user')
router.register(prefix='schedules-list', viewset=views.ScheduleListViewSet, basename='schedule-list')
router.register(prefix='schedules', viewset=views.ScheduleDetailViewSet, basename='schedule')
router.register(prefix='provinces', viewset=views.ProvinceViewSet, basename='province')
router.register(prefix='organizations', viewset=views.OrganizationViewSet, basename='organization')
router.register(prefix='my-tickets', viewset=views.MyTicketViewSet, basename='my-ticket')
router.register(prefix='tickets', viewset=views.TicketViewSet, basename='ticket')
router.register(prefix='stations', viewset=views.StationViewSet, basename='station')

urlpatterns = [
    path('', include(router.urls)),
]
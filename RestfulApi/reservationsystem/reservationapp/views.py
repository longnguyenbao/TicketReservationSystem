from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Route, Bus, Feedback, User, Schedule, Ticket, Province, Organization, Like, Station
from .serializers import (RouteSerializer,
                          BusSerializer,
                          BusDetailSerializer,
                          AuthBusDetailSerializer,
                          TicketSerializer,
                          FeedbackSerializer,
                          CreateFeedbackSerializer,
                          UserSerializer,
                          ScheduleListSerializer,
                          ScheduleDetailSerializer,
                          AuthScheduleDetailSerializer,
                          ProvinceSerializer,
                          OrganizationSerializer,
                          StationSerializer)
from .paginators import RoutePaginator, SchedulePaginator, TicketPaginator
from .perms import FeedbackOwnerPermission, TicketOwnerPermission, EmployeePermission
from django.utils import timezone
from rest_framework.parsers import MultiPartParser
from django.db.models import Sum


# Create your views here.
class RouteViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Route.objects.filter(active=True).order_by('id')
    serializer_class = RouteSerializer
    pagination_class = RoutePaginator

    def get_queryset(self):
        query = self.queryset

        frm = self.request.query_params.get('from')
        if frm:
            query = query.filter(departure_location__name__icontains=frm)

        to = self.request.query_params.get('to')
        if to:
            query = query.filter(arrival_location__name__icontains=to)

        return query

    @action(methods=['get'], detail=True, url_path=r'schedules')
    def get_schedules(self, request, pk):
        schedules = self.get_object().schedules2.filter(active=True, departure_time__gte=timezone.now()).order_by('id')

        page_size = 3
        start = request.query_params.get('page')
        if not start:
            start = 1
        start = int(start)
        start = (start-1) * page_size

        if schedules:
            return Response({'count': len(schedules),
                             'results': ScheduleListSerializer(schedules[start: start + page_size], many=True,
                            context={'request': request}).data}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ScheduleListViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Schedule.objects.filter(active=True).order_by('id')
    serializer_class = ScheduleListSerializer
    pagination_class = SchedulePaginator

    def get_queryset(self):
        query = self.queryset.filter(departure_time__gte=timezone.now())

        organization = self.request.query_params.get('org')
        if organization:
            query = query.filter(bus__organization__name__icontains=organization)

        departure_location = self.request.query_params.get('fp')
        if departure_location:
            query = query.filter(route__departure_location__name__icontains=departure_location)

        arrival_location = self.request.query_params.get('tp')
        if arrival_location:
            query = query.filter(route__arrival_location__name__icontains=arrival_location)

        departure_time = self.request.query_params.get('time')
        if departure_time:
            query = query.filter(departure_time__date=departure_time)

        return query


class ScheduleDetailViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Schedule.objects.filter(active=True, departure_time__gte=timezone.now())
    serializer_class = ScheduleDetailSerializer

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return AuthScheduleDetailSerializer

        return ScheduleDetailSerializer

    def get_permissions(self):
        if self.action in ['book_ticket']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['post'], detail=True, url_path='ticket')
    def book_ticket(self, request, pk):
        schedule = self.get_object()
        user = request.user
        quantity = int(request.data.get('quantity'))
        total_seats = schedule.bus.total_seats
        unavailable_seats = Ticket.objects.filter(schedule=schedule).aggregate(Sum('quantity')).get('quantity__sum')
        if unavailable_seats:
            unavailable_seats = unavailable_seats
        else:
            unavailable_seats = 0

        if total_seats - unavailable_seats - quantity >= 0:
            t = Ticket.objects.create(schedule=schedule, user=user, quantity=quantity)
            t.save()

            return Response(status=status.HTTP_201_CREATED)

        return Response(status=status.HTTP_409_CONFLICT)


class BusViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Bus.objects.filter(active=True)
    serializer_class = BusDetailSerializer

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return AuthBusDetailSerializer

        return BusDetailSerializer

    def get_permissions(self):
        if self.action in ['like']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='feedbacks', detail=True)
    def get_feedbacks(self, request, pk):
        bus = self.get_object()
        feedbacks = bus.feedbacks.select_related('user').order_by('-created_date')

        return Response(FeedbackSerializer(feedbacks, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='like', detail=True)
    def like(self, request, pk):
        bus = self.get_object()
        user = request.user

        l, _ = Like.objects.get_or_create(bus=bus, user=user)
        l.active = not l.active

        try:
            l.save()
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(data=AuthBusDetailSerializer(bus, context={'request': request}).data,
                        status=status.HTTP_200_OK)


class FeedbackViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Feedback.objects.filter(active=True)
    serializer_class = CreateFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [FeedbackOwnerPermission()]

        return [permissions.IsAuthenticated()]


class MyTicketViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Ticket.objects.filter(active=True, paid=0.0)
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.queryset

        user = self.request.user
        query = query.filter(user=user)

        return query

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [TicketOwnerPermission()]

        return [permissions.IsAuthenticated()]


class TicketViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                    generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Ticket.objects.filter(active=True, paid=0.0).order_by('id')
    serializer_class = TicketSerializer
    permission_classes = [EmployeePermission]
    pagination_class = TicketPaginator

    def get_queryset(self):
        query = self.queryset

        username = self.request.query_params.get('username')
        if username:
            query = query.filter(user__username__icontains=username)

        departure_station = self.request.query_params.get('dp')
        if departure_station:
            query = query.filter(schedule__departure_station__name__icontains=departure_station)

        departure_time = self.request.query_params.get('dt')
        if departure_time:
            query = query.filter(schedule__departure_time__date=departure_time)

        return query

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [EmployeePermission()]

        return [EmployeePermission()]


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_class = (MultiPartParser, )

    def get_permissions(self):
        if self.action == 'current_user':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path="current-user", detail=False)
    def current_user(self, request):
        return Response(self.serializer_class(request.user, context={'request': request}).data,
                        status=status.HTTP_200_OK)


class ProvinceViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Province.objects.filter(active=True)
    serializer_class = ProvinceSerializer


class StationViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Station.objects.filter(active=True)
    serializer_class = StationSerializer


class OrganizationViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Organization.objects.filter(active=True)
    serializer_class = OrganizationSerializer
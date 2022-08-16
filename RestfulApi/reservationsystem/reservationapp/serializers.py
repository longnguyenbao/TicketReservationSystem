from rest_framework import serializers
from .models import Route, Bus, Ticket, User, Feedback, Schedule, Province, Station, Type, Tag, Organization
from django.db.models import Sum


class UserSerializer(serializers.ModelSerializer):
    avatar_view = serializers.SerializerMethodField(source='avatar')

    def get_avatar_view(self, obj):
        request = self.context['request']
        if obj.avatar:
            path = obj.avatar.url

            return request.build_absolute_uri(path)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'avatar', 'avatar_view', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'avatar_path': {
                'read_only': True
            },
            'avatar': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()

        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u


class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ['id', 'name']


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['id', 'name']


class RouteSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(source='image')
    departure_location = ProvinceSerializer()
    arrival_location = ProvinceSerializer()

    def get_image(self, obj):
        request = self.context['request']
        if obj.image:
            path = obj.image.url

            return request.build_absolute_uri(path)

    class Meta:
        model = Route
        fields = ['id', 'departure_location', 'arrival_location', 'image']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name']


class OrganizationDetailSerializer(OrganizationSerializer):
    class Meta:
        model = OrganizationSerializer.Meta.model
        fields = OrganizationSerializer.Meta.fields + ['description']


class BusSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(source='image')

    def get_image(self, obj):
        request = self.context['request']
        if obj.image:
            path = obj.image.url

            return request.build_absolute_uri(path)

    class Meta:
        model = Bus
        fields = ['id', 'name', 'number_plate', 'image', 'total_seats']


class BusDetailSerializer(BusSerializer):
    tags = TagSerializer(many=True)
    organization = OrganizationDetailSerializer()

    class Meta:
        model = BusSerializer.Meta.model
        fields = BusSerializer.Meta.fields + ['description', 'tags', 'organization']


class AuthBusDetailSerializer(BusDetailSerializer):
    like = serializers.SerializerMethodField()

    def get_like(self, bus):
        request = self.context.get('request')
        if request:
            return bus.like_set.filter(user=request.user, active=True).exists()

    class Meta:
        model = Bus
        fields = BusDetailSerializer.Meta.fields + ['like']


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ['id', 'name', 'surcharge']


class ScheduleMinSerializer(serializers.ModelSerializer):
    bus = BusSerializer()
    type = TypeSerializer()
    departure_station = StationSerializer()
    arrival_station = StationSerializer()

    class Meta:
        model = Schedule
        fields = ['id', 'type', 'price', 'bus', 'departure_station', 'departure_time', 'arrival_station']


class ScheduleListSerializer(ScheduleMinSerializer):
    unavailable_seats = serializers.SerializerMethodField()

    def get_unavailable_seats(self, obj):
        return Ticket.objects.filter(active=True, schedule=obj).aggregate(Sum('quantity'))

    class Meta:
        model = ScheduleMinSerializer.Meta.model
        fields = ScheduleMinSerializer.Meta.fields + ['route', 'arrival_time', 'user', 'unavailable_seats']


class ScheduleDetailSerializer(ScheduleListSerializer):
    user = UserSerializer()
    bus = BusDetailSerializer()
    route = RouteSerializer()

    class Meta:
        model = ScheduleListSerializer.Meta.model
        fields = ScheduleListSerializer.Meta.fields


class AuthScheduleDetailSerializer(ScheduleDetailSerializer):
    bus = AuthBusDetailSerializer()

    class Meta:
        model = ScheduleDetailSerializer.Meta.model
        fields = ScheduleDetailSerializer.Meta.fields


class TicketSerializer(serializers.ModelSerializer):
    schedule = ScheduleMinSerializer()
    user = UserSerializer()

    class Meta:
        model = Ticket
        fields = ['id', 'schedule', 'user', 'quantity', 'paid', 'created_date']


class FeedbackSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Feedback
        fields = ['id', 'rate', 'content', 'created_date', 'updated_date', 'user']


class CreateFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['rate', 'content', 'bus', 'user']

from django.contrib import admin
from django.db.models import Count, Sum, Q
from django.template.response import TemplateResponse
from django.urls import path
from .models import User, Route, Bus, Ticket, Feedback, Schedule, Station, Province, Type, Tag, Organization
from django.utils.html import mark_safe
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.db.models.functions import Extract
from  django.utils import timezone


# Register your models here.
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'active', 'departure_location', 'arrival_location')
    list_filter = ('id', 'departure_location', 'arrival_location')
    search_fields = ['departure_location__name', 'arrival_location__name']
    readonly_fields = ['image_view']

    def image_view(self, route):
        if route:
            return mark_safe(
                '<img src="{url}" width="120" />'\
                    .format(url=route.image.url)
            )

    def get_urls(self):
        return [path('route-stats/', self.stat_view)] + super().get_urls()

    def stat_view(self, request):
        routes = Route.objects.filter(active=True).all()
        count = routes.count()

        my_month = timezone.now().month
        my_year = timezone.now().year
        my_quarter = 1
        quarter_checked = None
        stat_type = 'by_month'
        schedule_count_stats = []
        if request.method == 'POST':
            stat_type = request.POST.get('stat_type')
            if stat_type == 'by_month':
                month_input = request.POST.get('my_month')
                my_month = int(month_input.split("-")[1])
                my_year = int(month_input.split("-")[0])

            else:
                my_year = int(request.POST.get('my_year'))
                quarter_checked = request.POST.get('quarter_checked')
                if quarter_checked:
                    my_quarter = int(request.POST.get('my_quarter'))

        if stat_type == 'by_month':
            schedule_count_stats = routes.annotate(schedule_count=Count('my_schedule',
                filter = Q(my_schedule__departure_time__month=my_month, my_schedule__departure_time__year=my_year)))\
                .values('id', 'departure_location__name', 'arrival_location__name', 'schedule_count')

        else:
            if quarter_checked == None:
                schedule_count_stats = routes.annotate(schedule_count=Count('my_schedule',
                    filter = Q(my_schedule__departure_time__year=my_year)))\
                    .values('id', 'departure_location__name', 'arrival_location__name', 'schedule_count')
            else:
                schedule_count_stats = routes.annotate(schedule_count=Count('my_schedule',
                    filter = Q(my_schedule__departure_time__year=my_year, my_schedule__departure_time__quarter=my_quarter)))\
                    .values('id', 'departure_location__name', 'arrival_location__name', 'schedule_count')

        schedules_count = 0
        total_paid = [0.0] * count
        route_id = [0] * count

        for i in range(count):
            # schedules_count += routes[i].schedules2.count()
            route_id[i] = routes[i].id
            for s in routes[i].schedules2.all():
                if stat_type == 'by_month':
                    schedules_count += routes[i].schedules2.annotate(month=Extract('departure_time', 'month')) \
                        .filter(month=my_month).count()
                    tickets = s.tickets.annotate(month=Extract('updated_date', 'month'),
                                                 year=Extract('updated_date', 'year'))\
                        .filter(active=True, month=my_month, year=my_year).all()
                    for t in tickets:
                        total_paid[i] += t.paid
                else:
                    if quarter_checked == None:
                        schedules_count += routes[i].schedules2.annotate(year=Extract('departure_time', 'year')) \
                            .filter(year=my_year).count()
                        tickets = s.tickets.annotate(year=Extract('updated_date', 'year')) \
                            .filter(active=True, year=my_year).all()
                        for t in tickets:
                            total_paid[i] += t.paid
                    else:
                        schedules_count += routes[i].schedules2.annotate(year=Extract('departure_time', 'year'),
                                                                         quarter=Extract('departure_time', 'quarter')) \
                            .filter(year=my_year, quarter=my_quarter).count()
                        tickets = s.tickets.annotate(year=Extract('updated_date', 'year'),
                                                     quarter=Extract('updated_date', 'quarter')) \
                            .filter(active=True, year=my_year, quarter=my_quarter).all()
                        for t in tickets:
                            total_paid[i] += t.paid

        return TemplateResponse(request, 'admin/route-stats.html', {
            'count': count,
            'count_range': range(count),
            'schedule_count_stats': schedule_count_stats,
            'stats': zip(schedule_count_stats, total_paid),
            'schedules_count': schedules_count,
            'total_paid': zip(route_id, total_paid),
            'stat_type': stat_type,
            'my_month': my_month,
            'my_year': my_year,
            'my_quarter': my_quarter,
            'years': reversed(range(timezone.now().year-10, timezone.now().year+1)),
            'quarters': range(1, 4+1),
            'quarter_checked': quarter_checked
        })


class BusForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Bus
        fields = '__all__'


class BusAdmin(admin.ModelAdmin):
    form = BusForm
    readonly_fields = ['image_view']
    list_display = ('id', 'active', 'name', 'number_plate')
    list_filter = ('id', 'active', 'name', 'number_plate')

    def image_view(self, bus):
        if bus:
            return mark_safe(
                '<img src="{url}" width="120" />' \
                    .format(url=bus.image.url)
            )


class ScheduleForm(forms.ModelForm):
    class Meta:
        model = Schedule
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(ScheduleForm, self).__init__(*args, **kwargs)
        if self.instance.route:
            self.fields['departure_station'].queryset = Station.objects.filter(
                province_id=self.instance.route.departure_location_id)
            self.fields['arrival_station'].queryset = Station.objects.filter(
                province_id=self.instance.route.arrival_location_id)


class ScheduleAdmin(admin.ModelAdmin):
    form = ScheduleForm
    list_display = ('id', 'active', 'bus', 'user', 'departure_time')
    list_filter = ('id', 'active', 'bus', 'user', 'departure_time')
    search_fields = ['bus__name']


class UserForm(forms.ModelForm):
    def save(self, commit=True):
        user = super(UserForm, self).save(commit=False)

        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class UserAdmin(admin.ModelAdmin):
    form = UserForm
    list_display = ('id', 'is_active', 'username', 'role')
    list_filter = ('id', 'username', 'role')
    search_fields = ['username', 'role']
    readonly_fields = ['avatar_view']

    def avatar_view(self, user):
        if user:
            return mark_safe(
                '<img src="{url}" width="120" />' \
                    .format(url=user.avatar.url)
            )


class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'active', 'user', 'quantity')
    list_filter = ('id', 'active', 'user', 'quantity')


class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'active', 'created_date')
    list_filter = ('id', 'created_date')


class OrganizationForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Organization
        fields = '__all__'


class OrganizationAdmin(admin.ModelAdmin):
    form = OrganizationForm
    list_display = ('id', 'active', 'name')
    list_filter = ('id', 'active', 'name')


admin.site.register(User, UserAdmin)
admin.site.register(Province)
admin.site.register(Route, RouteAdmin)
admin.site.register(Station)
admin.site.register(Bus, BusAdmin)
admin.site.register(Schedule, ScheduleAdmin)
admin.site.register(Ticket, TicketAdmin)
admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Type)
admin.site.register(Tag)
admin.site.register(Organization, OrganizationAdmin)
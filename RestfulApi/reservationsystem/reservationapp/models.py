from django.db import models
from django.db.models import CheckConstraint, Q, F
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from django.utils import timezone
from cloudinary.models import CloudinaryField


# Create your models here.
class User(AbstractUser):
    class Role(models.IntegerChoices):
        CUSTOMER = 1
        ADMIN = 2
        DRIVER = 3
        EMPLOYEE = 4

    avatar = CloudinaryField('image', null=True, folder='LTHD/users')
    role = models.IntegerField(choices=Role.choices, default=Role.CUSTOMER)


class ModelBase(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Province(ModelBase):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Route(ModelBase):
    departure_location = models.ForeignKey(Province, null=True, on_delete=models.SET_NULL, related_name='route1')
    arrival_location = models.ForeignKey(Province, null=True, on_delete=models.SET_NULL, related_name='route2')
    image = CloudinaryField('image', null=True, folder='LTHD/routes')

    class Meta:
        unique_together = ('departure_location', 'arrival_location')

    def __str__(self):
        return '{} - {}'.format(self.departure_location, self.arrival_location)


class Station(ModelBase):
    name = models.CharField(max_length=50)
    province = models.ForeignKey(Province, null=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('name', 'province')

    def __str__(self):
        return '{} ({})'.format(self.name, self.province)


class Tag(ModelBase):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Organization(ModelBase):
    name = models.CharField(max_length=50, default='', unique=True)
    description = RichTextField(null=True, blank=True)

    def __str__(self):
        return '{}'.format(self.name)


class Bus(ModelBase):
    name = models.CharField(max_length=50, default='')
    number_plate = models.CharField(max_length=50, default='', unique=True)
    description = RichTextField(null=True, blank=True)
    image = CloudinaryField('image', null=True, folder='LTHD/buses')
    tags = models.ManyToManyField('Tag')
    total_seats = models.IntegerField(default=0)
    organization = models.ForeignKey(Organization, null=True, on_delete=models.SET_NULL, related_name='buses')

    def __str__(self):
        return '{} ({})'.format(self.name, self.number_plate)

    class Meta:
        constraints = [
            CheckConstraint(
                check=Q(total_seats__gt=0),
                name="check total_seats is greater than 0"
            ),
        ]


class Type(ModelBase):
    class Choice(models.Choices):
        NORMAL = 'NORMAL'
        HOLIDAY = 'HOLIDAY'
        TET = 'TET'
    name = models.CharField(choices=Choice.choices, default=Choice.NORMAL, max_length=20)
    surcharge = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('name', 'surcharge')
        constraints = [
            CheckConstraint(
                check=Q(surcharge__lte=1),
                name="check surcharge is less than 1"
            )
        ]

    def __str__(self):
        return '{}: {}'.format(self.name, self.surcharge)


class Schedule(ModelBase):
    type = models.ForeignKey(Type, null=True, on_delete=models.SET_NULL, related_name='schedules5')
    route = models.ForeignKey(Route, null=True, on_delete=models.SET_NULL, related_name='schedules2',
                              related_query_name='my_schedule')
    departure_station = models.ForeignKey(Station, null=True, on_delete=models.SET_NULL, related_name='schedules4')
    arrival_station = models.ForeignKey(Station, null=True, on_delete=models.SET_NULL, related_name='schedules3')
    departure_time = models.DateTimeField(default=timezone.now)
    arrival_time = models.DateTimeField(default=timezone.now)
    price = models.FloatField(default=0.0)
    bus = models.ForeignKey(Bus, null=True, on_delete=models.SET_NULL, related_name='schedules')
    user = models.ForeignKey(User, limit_choices_to={'role': User.Role.DRIVER}, null=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('bus', 'departure_time')
        constraints = [
            CheckConstraint(
                check=Q(departure_time__gte=timezone.now()),
                name="check departure_time is greater than now"
            ),
            CheckConstraint(
                check=Q(arrival_time__gt=F('departure_time')),
                name='check arrival_time is greater than departure_time',
            ),
            CheckConstraint(
                check=~Q(departure_station=F('arrival_station')),
                name='check departure_station is not arrival_station',
            )
        ]

    def __str__(self):
        return '{}-{}: {}'.format(self.id, self.bus, self.departure_time)


class Ticket(ModelBase):
    paid = models.FloatField(default=0.0)
    quantity = models.IntegerField(default=0)
    schedule = models.ForeignKey(Schedule, null=True, on_delete=models.SET_NULL, related_name='tickets',
                                 related_query_name='my_ticket')
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return '{} - {} - {}'.format(self.id, self.schedule.id, self.user)


class Feedback(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rate = models.SmallIntegerField(default=0)
    content = models.TextField()

    def __str__(self):
        return self.content

    class Meta:
        unique_together = ('user', 'bus')


class Like(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    active = models.BooleanField(default=False)
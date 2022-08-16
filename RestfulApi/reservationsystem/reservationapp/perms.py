from rest_framework import permissions


class FeedbackOwnerPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, feedback):
        return request.user == feedback.user


class TicketOwnerPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, ticket):
        return request.user == ticket.user


class EmployeePermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 4
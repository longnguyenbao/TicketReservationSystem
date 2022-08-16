from rest_framework import pagination


class RoutePaginator(pagination.PageNumberPagination):
    page_size = 3
    page_query_param = 'page'


class SchedulePaginator(pagination.PageNumberPagination):
    page_size = 3
    page_query_param = 'page'


class TicketPaginator(pagination.PageNumberPagination):
    page_size = 10
    page_query_param = 'page'
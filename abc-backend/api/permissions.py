from rest_framework.permissions import BasePermission, SAFE_METHODS

class ReadOnlyOrAdmin(BasePermission):
    """
    Allows unrestricted GET access.
    Requires admin privileges for POST, PUT, DELETE.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS: # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff

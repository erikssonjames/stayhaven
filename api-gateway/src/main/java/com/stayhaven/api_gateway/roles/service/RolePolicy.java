package com.stayhaven.api_gateway.roles.service;

import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.users.types.UserRole;
import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public final class RolePolicy {
    private static final Map<UserRole, Set<RolePermission>> ROLE_PERMISSIONS = buildRolePermissions();

    private RolePolicy() {
    }

    public static boolean hasPermission(UserRole role, RolePermission permission) {
        if (role == null || permission == null) {
            return false;
        }

        return ROLE_PERMISSIONS.getOrDefault(role, Set.of()).contains(permission);
    }

    public static Set<RolePermission> permissionsFor(UserRole role) {
        if (role == null) {
            return Set.of();
        }

        return ROLE_PERMISSIONS.getOrDefault(role, Set.of());
    }

    private static Map<UserRole, Set<RolePermission>> buildRolePermissions() {
        Map<UserRole, Set<RolePermission>> permissions = new EnumMap<>(UserRole.class);

        permissions.put(UserRole.USER, immutableEnumSet(
            RolePermission.BOOKING_CREATE_OWN,
            RolePermission.BOOKING_MANAGE_OWN,
            RolePermission.SETTINGS_MANAGE_OWN,
            RolePermission.USER_CREATE,
            RolePermission.USER_UPDATE_OWN
        ));

        permissions.put(UserRole.HOST, immutableEnumSet(
            RolePermission.RENTAL_MANAGE_OWN,
            RolePermission.USER_UPDATE_OWN
        ));

        permissions.put(UserRole.ADMIN, immutableEnumSet(
            RolePermission.HOST_CREATE,
            RolePermission.HOST_ACCEPT,
            RolePermission.BOOKING_MANAGE_ALL,
            RolePermission.RENTAL_MANAGE_ALL,
            RolePermission.USER_MANAGE_ALL,
            RolePermission.HOST_MANAGE_ALL
        ));

        EnumSet<RolePermission> superadminPermissions = EnumSet.noneOf(RolePermission.class);
        superadminPermissions.addAll(permissions.get(UserRole.USER));
        superadminPermissions.addAll(permissions.get(UserRole.HOST));
        superadminPermissions.addAll(permissions.get(UserRole.ADMIN));
        superadminPermissions.add(RolePermission.ADMIN_MANAGE);
        superadminPermissions.add(RolePermission.PAYMENT_VIEW);
        permissions.put(UserRole.SUPERADMIN, Collections.unmodifiableSet(superadminPermissions));

        return Collections.unmodifiableMap(permissions);
    }

    private static Set<RolePermission> immutableEnumSet(RolePermission first, RolePermission... rest) {
        return Collections.unmodifiableSet(EnumSet.of(first, rest));
    }
}

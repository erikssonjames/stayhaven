package com.stayhaven.api_gateway.roles.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.stayhaven.api_gateway.roles.types.RolePermission;
import com.stayhaven.api_gateway.users.types.UserRole;
import org.junit.jupiter.api.Test;

class RolePolicyTests {
    @Test
    void userCanManageOwnBookingsSettingsAndAccount() {
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.BOOKING_CREATE_OWN)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.BOOKING_MANAGE_OWN)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.SETTINGS_MANAGE_OWN)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.USER_CREATE)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.USER_UPDATE_OWN)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.USER, RolePermission.USER_MANAGE_ALL)).isFalse();
    }

    @Test
    void hostCanOnlyManageOwnRentals() {
        assertThat(RolePolicy.hasPermission(UserRole.HOST, RolePermission.RENTAL_MANAGE_OWN)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.HOST, RolePermission.RENTAL_MANAGE_ALL)).isFalse();
        assertThat(RolePolicy.hasPermission(UserRole.HOST, RolePermission.HOST_ACCEPT)).isFalse();
    }

    @Test
    void adminCanManageOperationalResourcesButNotAdminsOrPayments() {
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.HOST_CREATE)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.HOST_ACCEPT)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.BOOKING_MANAGE_ALL)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.RENTAL_MANAGE_ALL)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.USER_MANAGE_ALL)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.HOST_MANAGE_ALL)).isTrue();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.ADMIN_MANAGE)).isFalse();
        assertThat(RolePolicy.hasPermission(UserRole.ADMIN, RolePermission.PAYMENT_VIEW)).isFalse();
    }

    @Test
    void superadminHasAllRolePermissionsAndCanOnlyViewPayments() {
        for (RolePermission permission : RolePermission.values()) {
            assertThat(RolePolicy.hasPermission(UserRole.SUPERADMIN, permission)).isTrue();
        }
    }
}

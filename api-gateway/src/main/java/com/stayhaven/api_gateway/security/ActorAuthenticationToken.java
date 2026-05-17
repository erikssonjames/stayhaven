package com.stayhaven.api_gateway.security;

import java.util.Collection;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public class ActorAuthenticationToken extends AbstractAuthenticationToken {
    private final AuthenticatedActor actor;

    public ActorAuthenticationToken(AuthenticatedActor actor, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.actor = actor;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public AuthenticatedActor getPrincipal() {
        return actor;
    }
}

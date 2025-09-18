package com.example.authservice.user.entity;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.authservice.global.common.BaseEntity;

import lombok.*;

/** UserDetails를 구현하고 BaseEntity를 상속받는 User 엔터티 객체임. */
@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

  // PK
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // username
  @Column(nullable = false)
  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  private String username;

  // email
  @Column(unique = true, nullable = false)
  @Email(message = "Email should be valid")
  @NotBlank(message = "Email is required")
  private String email;

  // password
  @Column(nullable = false)
  @NotBlank(message = "Password is required")
  @Size(min = 8, message = "Password must be at least 8 characters long")
  private String password;

  // role(USER, ADMIN)
  @Enumerated(EnumType.STRING)
  @Builder.Default
  private Role role = Role.USER;

  @Builder.Default private boolean enabled = true;

  @Builder.Default private boolean accountNonExpired = true;

  @Builder.Default private boolean accountNonLocked = true;

  @Builder.Default private boolean credentialsNonExpired = true;

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public boolean isAccountNonExpired() {
    return accountNonExpired;
  }

  @Override
  public boolean isAccountNonLocked() {
    return accountNonLocked;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return credentialsNonExpired;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    User user = (User) o;
    return Objects.equals(id, user.id) && Objects.equals(username, user.username);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, username);
  }
}

package com.smeal.entity;
import jakarta.persistence.*; import java.time.LocalDateTime; import java.util.*;
@Entity @Table(name="users") public class User {
 @Id private UUID id=UUID.randomUUID(); @Column(nullable=false,unique=true) private String email; @Column(name="password_hash",nullable=false) private String passwordHash; @Column(nullable=false) private String name; @Column(nullable=false) private String role="USER"; @Column(name="created_at",nullable=false) private LocalDateTime createdAt=LocalDateTime.now(); @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt=LocalDateTime.now(); @OneToMany(mappedBy="user",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.LAZY) private List<Meal> meals=new ArrayList<>();
 protected User(){} public User(String email,String passwordHash,String name){this.email=email;this.passwordHash=passwordHash;this.name=name;}
 @PreUpdate void touch(){updatedAt=LocalDateTime.now();} public UUID getId(){return id;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public String getName(){return name;} public String getRole(){return role;}
}

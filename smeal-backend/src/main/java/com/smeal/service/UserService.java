package com.smeal.service;
import com.smeal.entity.User; import com.smeal.exception.ResourceNotFoundException; import com.smeal.repository.UserRepository; import java.util.UUID; import org.springframework.stereotype.Service;
@Service public class UserService {private final UserRepository users;public UserService(UserRepository users){this.users=users;}public User findById(UUID id){return users.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found"));}}

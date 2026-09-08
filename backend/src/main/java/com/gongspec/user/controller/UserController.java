package com.gongspec.user.controller;

import com.gongspec.user.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @SuppressWarnings("unused")
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
}

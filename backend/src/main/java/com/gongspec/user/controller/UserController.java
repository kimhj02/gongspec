package com.gongspec.user.controller;

import com.gongspec.auth.CurrentUser;
import com.gongspec.user.dto.NicknameRequest;
import com.gongspec.user.dto.UserResponse;
import com.gongspec.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me/nickname")
    public UserResponse setNickname(@Valid @RequestBody NicknameRequest request) {
        return UserResponse.from(userService.setSiteNickname(CurrentUser.id(), request.nickname()));
    }
}

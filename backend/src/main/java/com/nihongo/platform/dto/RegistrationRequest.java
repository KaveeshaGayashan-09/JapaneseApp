package com.nihongo.platform.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistrationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    /** N5, N4, N3, N2, N1, BEGINNER, NONE */
    private String jlptLevel;

    private String bio;
    private String country;
}

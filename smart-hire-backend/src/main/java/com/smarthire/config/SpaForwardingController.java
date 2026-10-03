package com.smarthire.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardingController {

    @GetMapping(value = "/{path:[^\\.]*}")
    public String redirectRootPaths() {
        return "forward:/index.html";
    }

    @GetMapping(value = "/{path:^(?!api|h2-console|health|error|assets|static|uploads).*$}/**/{subpath:[^\\.]*}")
    public String redirectSubPaths() {
        return "forward:/index.html";
    }
}

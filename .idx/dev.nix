{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_22sk-or-v1-4c24589813b72dc763933d563c7d9a7c20236f77dc4e9f2cc7930d28deb7ec4f,
    pkgs.yarn,
    pkgs.turbo,
    pkgs.openjdk
  ];
  env = {
    SOME_ENV_VAR = "hello";
  };
  idx.extensions = [
    "angular.ng-template"
  ];
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "yarn",
          "run",
          "dev:web",
          "--",
          "--port",
          "$PORT",
          "--hostname",
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}

{ pkgs, ... }: {

  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_22sk-or-v1-4c24589813b72dc763933d563c7d9a7c20236f77dc4e9f2cc7930d28deb7ec4f,
    pkgs.yarn,
    pkgs.turbo
  ];

  # Sets environment variables in the workspace
  env = {
    SOME_ENV_VAR = "hello";
  };

  # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
  idx.extensions = [
    "angular.ng-template"
  ];

  # Enable previews and customize configuration
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

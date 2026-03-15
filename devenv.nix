{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  languages.typescript.enable = true;
  languages.javascript = {
    enable = true;
    pnpm.enable = true;
  };
}

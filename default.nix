{ pkgs }:

with pkgs;
let
  yarn2nix = yarn2nix-moretea.override {
    nodejs = nodejs-18_x;
    yarn = pkgs.yarn.override { inherit nodejs; };
  };
  frontend = import ./src/frontend { inherit pkgs; };
in yarn2nix.mkYarnPackage rec {
  name = "mcid";
  src = ./.;
  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;
  yarnNix = ./yarn.nix;
  buildPhase = ''
    yarn --offline run postinstall
  '';
  nativeBuildInputs = [ makeWrapper ];
  postFixup = ''
    wrapProgram $out/bin/mcid --set STATIC_PATH ${./frontend-build}
  '';
}

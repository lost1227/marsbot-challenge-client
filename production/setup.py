import os
import json
import zipfile
from pathlib import Path
import urllib.request
import urllib.parse
import shutil

scriptdir = Path(__file__).parent
os.chdir(scriptdir)

CLIENT_RELEASE_URL = "https://api.github.com/repos/lost1227/marsbot-challenge-client/releases"
NGINX_URL = "http://nginx.org/download/nginx-1.23.3.zip"

with urllib.request.urlopen(CLIENT_RELEASE_URL) as socket:
    releases = json.load(socket)

release = releases[0]
asset = release['assets'][0]

print(f"Downloading {asset['name']} from marsbot-challenge-client release {release['tag_name']}")

zippath = Path.cwd() / asset['name']
with zippath.open("wb") as outf, urllib.request.urlopen(asset['browser_download_url']) as inf:
    outf.write(inf.read())

with zipfile.ZipFile(zippath, "r") as zip:
    zip.extractall()

zippath.unlink()

nginx_dirname = Path(urllib.parse.urlparse(NGINX_URL).path).name
print(f"Downloading {nginx_dirname}")


zippath = Path.cwd() / nginx_dirname
with zippath.open("wb") as outf, urllib.request.urlopen(NGINX_URL) as inf:
    outf.write(inf.read())

with zipfile.ZipFile(zippath, "r") as zip:
    zip.extractall()
zippath.unlink()

print("Copying configuration files")
nginx_path = Path.cwd() / (Path(nginx_dirname).stem)
assert nginx_path.is_dir()

mimetypes = nginx_path / "conf/mime.types"
confdir = Path.cwd() / "conf"

shutil.copyfile(mimetypes, confdir / mimetypes.name)

print("Configuring directory structure")
extra_dirs = ['logs', 'temp']
for dir in extra_dirs:
    dirp = Path.cwd() / dir
    if not dirp.is_dir():
        dirp.mkdir()

print("Generating run.bat")
runscript = Path.cwd() / "run.bat"
with runscript.open("w") as outf:
    outf.write("@ECHO OFF\n")
    outf.write(f"cd {str(scriptdir)}\n")
    outf.write("echo Running NGINX... Make sure to start the MarsbotHost program\n")
    outf.write(f"{str(nginx_path / 'nginx.exe')} -c {str(confdir / 'nginx.conf')}\n")


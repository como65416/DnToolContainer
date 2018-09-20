# Dn Tool Container

An convenient APP can install anything tools which are created as static html file.

## Usage

### Install tool

1. Create an directory on `~/.dn-tool-container/installed_packages`

> Example : `~/.dn-tool-container/installed_packages/encode-decode/`

2. Add your tool static html file to the directory

> Example Directory files:

```
.
├── md5.html
├── base64.html
└── js
    └── main.js
```

3. Add `icon.png` and `config.json` file to the directory

> config.json structure :

```json
{
    "groupName" : "Encode/Decdoe Utils",
    "options" : [
      {
        "name" : "MD5 Encode/Decdoe",
        "uri" : "md5.html"
      },
      {
        "name" : "Base64 Encode/Decdoe",
        "uri" : "base64.html"
      }

    ]
}
```

> Example Directory files:

```
.
├── config.json
├── icon.png
├── md5.html
├── base64.html
└── js
    └── main.js
```

4. Run the App

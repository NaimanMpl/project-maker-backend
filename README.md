# project-maker-backend

Backend for the "Project Maker" front-end

### Built With

- [![TS][Typescript]][Typescript-url]

## Getting Started

### Installation

1. Clone the repo

```sh
git clone https://github.com/NaimanMpl/project-maker-backend.git
```

2. Install npm packages

```sh
npm install
```

3. Launch app

```sh
npm run dev
```

### Build the app

1. Launch the build command

```sh
npm run build
```

**Note: On Windows, the `cp` command will not work as expected. We recommand using WSL or use the `copy` command.**

2. Start the web server

```sh
npm run start
```

## Environment Variables

| Key      | Description                                                                                                | Default  |
| -------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| DEV_MODE | Determines if developer functionnality will be enabled such as restart button. Need to be set to "enabled" | disabled |
| GAMEMODE | If set to "unity" a unity player will be required to start the game                                        |          |
| PORT     | Port used by the server                                                                                    | 3001     |

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

[Typescript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/

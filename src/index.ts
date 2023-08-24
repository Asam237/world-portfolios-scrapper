import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import readline from "readline";

const inquirer = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const array = [
  { myId: 1, Country: "Togo", input: "tg" },
  { myId: 2, Country: "Benin", input: "bj" },
  { myId: 3, Country: "Senegal", input: "sn" },
  { myId: 4, Country: "Ivory Coast", input: "ci" },
  { myId: 5, Country: "France", input: "fr" },
  { myId: 6, Country: "South Korea", input: "kr" },
  { myId: 8, Country: "USA", input: "us" },
  { myId: 7, Country: "India", input: "in" },
];

const transformed = array.reduce((acc: any, { myId, ...x }) => {
  acc[myId] = x;
  return acc;
}, {});

console.table(transformed);

inquirer.question(
  "\n\nEnter the country (Cameroon by default): ",
  async (country) => {
    const url = "https://wp.lndev.me/" + country;
    const AxiosInstance = axios.create();
    const cvWriter = createObjectCsvWriter({
      path: "./portfolios.csv",
      header: [
        { id: "index", title: "Number" },
        { id: "programmer", title: "Name" },
        { id: "link", title: "Link of your portfolio" },
        { id: "domain", title: "Domain" },
      ],
    });

    interface IUser {
      index: number;
      programmer: string;
      link: string;
      domain: any;
    }
    await AxiosInstance.get(url)
      .then(async (response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const usersRow = $(".main-container-body > .card");
        const users: IUser[] = [];
        usersRow.each((i, elem) => {
          const programmer: string = $(elem)
            .find(".card-container > h2")
            .text();
          const link: string = $(elem).find(".card-container > a").text();
          const domain: string = $(elem).find(".card-tags > span").text();
          users.push({ index: i, programmer, link, domain });
        });
        await cvWriter.writeRecords(users);
        fs.writeFileSync("./portfolios.json", JSON.stringify(users), "utf8");
      })
      .catch(console.error);
    inquirer.close();
  }
);

inquirer.on("close", function () {
  console.log(
    "\nPlease open the file porfolios.json or portfolios.csv to see the list of portfolios\n\nGood bye!\n\n"
  );
  process.exit(0);
});

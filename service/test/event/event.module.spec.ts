import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createApp } from "test/create-app";
import { cleanUp } from "test/clean-up";
import { expect } from "chai";

import { FullSnapshotEvent, EventType } from "@traps/record";
import { NodeType } from "@traps/snapshot";

describe("event module e2e", async () => {
  let app: INestApplication;

  before(async () => {
    app = await createApp();
  });

  after(async () => {
    await app.close();
    await cleanUp();
  });

  it("report event", async () => {
    const data: FullSnapshotEvent = {
      type: EventType.FULL_SNAPSHOT,
      data: {
        adds: [
          {
            node: {
              type: NodeType.ELEMENT_NODE,
              tagName: "DIV",
              id: 0,
              attributes: {},
              isSVG: false,
            },
          },
        ],
        offset: { top: 0, left: 0 },
      },
    };
    const { body } = await request(app.getHttpServer())
      .post("/event")
      .send(data)
      .expect(201);

    expect(body).deep.eq(data);
  });
});

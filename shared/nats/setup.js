import { natsWrapper } from "./wrapper.js";
import { logger } from "../utils/logger.js";
import { jetstreamConfig } from "../config/jetstream.js";

export const setupJetStream = async () => {
  const jsm = natsWrapper.jsm;

  const {
    name: STREAM_NAME,
    subjects: REQUIRED_SUBJECTS,
    retention,
    max_msgs,
    max_bytes,
    max_age,
  } = jetstreamConfig;

  let stream;

  try {
    stream = await jsm.streams.info(STREAM_NAME);
    logger.info(`[NATS] Stream exists ${STREAM_NAME}`);
  } catch {
    logger.warn(`[NATS] Stream not found creating ${STREAM_NAME}...`);

    stream = await jsm.streams.add({
      name: STREAM_NAME,
      subjects: REQUIRED_SUBJECTS,
      retention,
      max_msgs,
      max_bytes,
      max_age,
    });

    logger.info(`[NATS] Stream created ${STREAM_NAME}`);
    return stream;
  }

  // Stream existed -> ensure subjects updated
  const existingSubjects = new Set(stream.config.subjects);
  const missingSubjects = REQUIRED_SUBJECTS.filter((s) => !existingSubjects.has(s));

  if (missingSubjects.length > 0) {
    logger.warn(`[NATS] Stream missing subjects -> adding: ${missingSubjects.join(", ")}`);

    const updatedSubjects = [...existingSubjects, ...missingSubjects];

    await jsm.streams.update(STREAM_NAME, {
      ...stream.config,
      subjects: updatedSubjects,
    });

    logger.info(`[NATS] Stream subjects updated`);
  }

  return stream;
};

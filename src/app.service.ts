import { Injectable } from '@nestjs/common';
import { Consumer, DtlsParameters, Producer, ProducerOptions, Router, RtpCapabilities, RtpCodecCapability, Transport, Worker } from 'mediasoup/lib/types'
const mediasoup = require('mediasoup')

@Injectable()
export class AppService {
  public workers: Worker[]
  public routers: Router[]
  public transports: Transport[]
  public producers: Producer[]
  public consumers: Consumer[]

  constructor() {
    this.createWorker()
  }

  async createWorker() {
    this.workers = []
    this.routers = []
    this.transports = []
    this.producers = []
    this.consumers = []
    const worker = await mediasoup.createWorker()
    this.workers.push(worker)
  }

  getRtpCapabilities(routerId: string) {
    for (let i = 0; i < this.routers.length; i++) {
      if (this.routers[i].id == routerId) {
        return this.routers[i].rtpCapabilities
      }
    }
  }

  async createRouter() {
    let worker: Worker
    for (let i = 0; i < this.workers.length; i++) {
      worker = this.workers[i]
      break
    }
    let audio: RtpCodecCapability
    let video: RtpCodecCapability
    audio = {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2
    },
    video = {
      kind: "video",
      mimeType: "video/H264",
      clockRate: 90000
    }
    const mediaCodecs = [audio, video]
    const router = await worker.createRouter({ mediaCodecs })
    this.routers.push(router)
    return router.id
  }

  async createTransport(routerId: string) {
    let router: Router
    for (let i = 0; i < this.routers.length; i++) {
      if (this.routers[i].id == routerId) {
        router = this.routers[i]
        break
      }
    }
    const transport = await router.createWebRtcTransport({
      listenIps: [ { ip: "0.0.0.0", announcedIp: "192.168.1.115" } ],
      enableUdp : true,
      enableTcp : true,
      preferUdp : true
    })
    this.transports.push(transport)
    return transport
  }

  async connectTransport(transportId: string, dtlsParameters: DtlsParameters) {
    let transport: Transport
    for (let i = 0; i < this.transports.length; i++) {
      if (this.transports[i].id == transportId) {
        transport = this.transports[i]
        break
      }
    }
    try {
      await transport.connect({ dtlsParameters: dtlsParameters})
      return "Connected"
    }
    catch(error) {
      return error.message
    }
  }

  async createProducer(transportId: string, producerOptions: ProducerOptions) {
    let transport: Transport
    for (let i = 0; i < this.transports.length; i++) {
      if (this.transports[i].id == transportId) {
        transport = this.transports[i]
        break
      }
    }
    const producer = await transport.produce(producerOptions)
    this.producers.push(producer)
    return producer
  }

  async createConsumer(transportId: string, producerId: string, rtpCapabilities: RtpCapabilities) {
    let transport: Transport
    for (let i = 0; i < this.transports.length; i++) {
      if (this.transports[i].id == transportId) {
        transport = this.transports[i]
        break
      }
    }
    const consumer = await transport.consume({
      producerId: producerId,
      rtpCapabilities: rtpCapabilities
    })
    this.consumers.push(consumer)
    return consumer
  }

  getTransportsByRouterId(routerId: string) {
    let transports = new Set()
    for (let i = 0; i < this.producers.length; i++) {
      let producer = JSON.parse(JSON.stringify(this.producers[i]))
      if (producer._internal.routerId == routerId) {
        transports.add(producer._internal.transportId)
      }
    }
    return Array.from(transports)
  }

  getProducersByTransportId(transportId: string) {
    let producers = new Set()
    for (let i = 0; i < this.producers.length; i++) {
      let producer = JSON.parse(JSON.stringify(this.producers[i]))
      if (producer._internal.transportId == transportId) {
        producers.add(producer._internal.producerId)
      }
    }
    return Array.from(producers)
  }

  closeTransport(transportId: string) {
    let transport: Transport
    let newTransports = this.transports.filter((value, index, arr) => {
      if (value.id != transportId) {
        return value
      } else {
        transport = value
      }
    })
    let newProduers = this.producers.filter((value, index, arr) => {
      let producer = JSON.parse(JSON.stringify(value))
      if (producer._internal.transportId != transportId) {
        return value
      }
    })
    let newConsumers = this.consumers.filter((value, index, arr) => {
      let consumer = JSON.parse(JSON.stringify(value))
      if (consumer._internal.transportId != transportId) {
        return value
      }
    })
    this.transports = newTransports
    this.producers = newProduers
    this.consumers = newConsumers
    transport.close()
  }
}

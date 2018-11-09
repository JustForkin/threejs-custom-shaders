export default class {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  append(value) {
    let newNode = new Node(value);
    if (this.head == null) {
      // means it's the first node to be added to the list
      this.head = newNode;
      this.head.index = 0;
      this.tail = null;
    } else {
      if (this.tail == null) {
        // means it's the second node to be added to the list
        this.tail = newNode;
        this.tail.index = 1;

        // do the circular reference magic
        this.head.setNext(this.tail);
        this.head.setPrev(this.tail);
        this.tail.setNext(this.head);
        this.tail.setPrev(this.head);
      } else {
        let prevTail = this.tail;
        this.tail = newNode;
        this.tail.index = this.length;

        // do the circular reference magic
        this.tail.setPrev(prevTail);
        this.tail.setNext(this.head);
        this.head.setPrev(this.tail);
        prevTail.setNext(this.tail);
      }
    }
    this.length++;
    return newNode;
  }

}

class Node {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
    this.index = null;
  }
  setPrev(node) {
    this.prev = node;
  }
  setNext(node) {
    this.next = node;
  }
}

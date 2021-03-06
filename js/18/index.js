const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let current;
let selection = [];

const tools = {
  graffity: {
    mousemove(e) {
      //e.buttons 0b00000x11 & 0b00000100 == x
      e.buttons & 1 &&
        new Circle(e.clientX, e.clientY, +size.value, color.value);
    },
  },
  circle: {
    mousedown(e) {
      current = new Circle(e.clientX, e.clientY, 1, color.value);
    },
    mousemove(e) {
      if (!current) return;

      current.radius = current.distanceTo(e.clientX, e.clientY);
      Drawable.drawAll();
    },

    mouseup(e) {
      current = null;
    },
  },
  line: {
    mousedown(e) {
      current = new Line(e.clientX, e.clientY, 0, 0, color.value, +size.value);
    },
    mousemove(e) {
      if (!current) return;

      current.width = e.clientX - current.x;
      current.height = e.clientY - current.y;

      Drawable.drawAll();
    },

    mouseup(e) {
      current = null;
    },
  },
  rectangle: {
    mousedown(e) {
      current = new Rectangle(
        e.clientX,
        e.clientY,
        0,
        0,
        color.value,
        +size.value
      );
    },
    mousemove(e) {
      if (!current) return;

      current.width = e.clientX - current.x;
      current.height = e.clientY - current.y;

      Drawable.drawAll();
    },

    mouseup(e) {
      current = null;
    },
  },
  ellipse: {
    mousedown(e) {
      current = new Ellipse(
        e.clientX,
        e.clientY,
        0,
        0,
        color.value,
        +size.value
      );
    },
    mousemove(e) {
      if (!current) return;

      current.width = e.clientX - current.x;
      current.height = e.clientY - current.y;

      Drawable.drawAll();
    },

    mouseup(e) {
      current = null;
    },
  },
  select: {
    click(e) {
      console.log(e);
      let found = Drawable.instances.filter(
        (c) => c.in && c.in(e.clientX, e.clientY)
      );
      if (found.length) {
        if (e.ctrlKey) {
          selection.push(found.pop());
        } else {
          selection = [found.pop()];
        }
      } else {
        if (!e.ctrlKey) selection = [];
      }

      Drawable.drawAll(selection);
    },
    mousedown(e) {
      //
    },
    mousemove(e) {},

    mouseup(e) {
      //x,y, w, h ????????????????????????????
      //  Drawable.instances(this.x,this.y,this.width, this.height)
      //selection - ???????????? ???? ?????????????????? Drawable.instances ?????????????? ?? ???????????????? ????????????????????????????.
    },
  },
};

function superHandler(evt) {
  let t = tools[tool.value];
  if (typeof t[evt.type] === "function") t[evt.type].call(this, evt);
}

canvas.onmousemove = superHandler;
canvas.onmouseup = superHandler;
canvas.onmousedown = superHandler;
canvas.onclick = superHandler;

////

function Drawable() {
  Drawable.addInstance(this);
}

const distance = (x1, y1, x2, y2) => ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;

Drawable.prototype.draw = function () {};
Drawable.prototype.distanceTo = function (x, y) {
  if (typeof this.x !== "number" || typeof this.y !== "number") {
    return NaN;
  }
  return distance(this.x, this.y, x, y);
};
Drawable.instances = [];
Drawable.addInstance = function (item) {
  Drawable.instances.push(item);
};

Drawable.drawAll = function (selection = []) {
  ctx.clearRect(0, 0, width, height);
  Drawable.forAll((item) => item.draw());
  selection.forEach((item) => item.draw(true));
};

Drawable.forAll = function (callback) {
  for (var i = 0; i < Drawable.instances.length; i++) {
    callback(Drawable.instances[i]);
  }
};

class Circle extends Drawable {
  constructor(x, y, radius, color) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;

    this.draw();
  }

  draw(selected) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = this.color;
    if (selected) {
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.fill();
  }

  in(x, y) {
    return this.distanceTo(x, y) < this.radius;
  }

  inBounds(x, y, w, h) {
    // x = 100, this.x = 102, w = 5
    return this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h;
  }
}

class Line extends Drawable {
  constructor(x, y, width, height, color, lineWidth) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.lineWidth = lineWidth;
    this.draw();
  }
  draw(selected) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;

    if (selected) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y);
      ctx.closePath();
      ctx.lineWidth = 15;
      ctx.stroke();
      //alert('select in line')
    }
    ctx.stroke();
  }

  in(x, y) {
    let alfa = Math.atan2(this.height, this.width);
    let betta = Math.atan2(y - this.y, x - this.x);
    let gamma = betta - alfa;
    //console.log("???????? ??????????????????",alfa)
    // console.log("???????? ????????" , betta)
    //  console.log(" ?????????????? ???????? " , gamma)

    let distanceToCursor = distance(x, y, this.x, this.y);
    //console.log("???????????????????? ???? ?????????????? " , distanceToCursor)
    let rotateX = Math.cos(gamma) * distanceToCursor;
    let rotateY = Math.sin(gamma) * distanceToCursor;
    let lineLength = this.distanceTo(this.x + this.width, this.y + this.height);

    return (
      rotateX > 0 &&
      rotateX < lineLength &&
      rotateY > this.lineWidth / -2 &&
      rotateY < this.lineWidth / 2
    );
  }
}

color.onchange = () => {
  selection.forEach((c) => (c.color = color.value));
  Drawable.drawAll(selection);
};

document.getElementById("delete").onclick = () => {
  Drawable.instances = Drawable.instances.filter(
    (item) => !selection.includes(item)
  );
  selection = [];
  Drawable.drawAll();
};

class Rectangle extends Drawable {
  constructor(x, y, width, height, color) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.draw();
  }

  draw(selected) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (selected) {
      ctx.lineWidth = 10;
      ctx.stroke();
    }
  }
  in(x, y) {
    return (
      x > this.x &&
      y > this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  }
}

class Ellipse extends Drawable {
  constructor(x, y, width, height, color) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.draw();
  }

  get rx() {
    return this.width / 2;
  }

  get ry() {
    return this.height / 2;
  }
  get h() {
    return this.x + this.rx;
  }
  get k() {
    return this.y + this.ry;
  }

  draw(selected) {
    ctx.beginPath();
    ctx.ellipse(this.h, this.k, this.rx, this.ry, 0, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    if (selected) {
      // console.log('select in ellipse')
      ctx.lineWidth = 10;
      ctx.stroke();
    }

    ctx.fill();
  }

  in(x, y) {
    return (
      (x - this.h) ** 2 / this.rx ** 2 + (y - this.k) ** 2 / this.ry ** 2 <= 1
    );
  }
}

//new Line(0,0,100,100, "red")
////new Circle(30,30,10, "red")

////canvas.onmousemove = function(e){
////}

//undo.onclick = function(){
//Drawable.instances.pop()
////Drawable.instances = []
//Drawable.drawAll()
//}

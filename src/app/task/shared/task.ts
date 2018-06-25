export enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3
}

export enum Status {
  NEW = 1,
  IN_PROGRESS = 2,
  FINISHED = 3
}

export class Task {
  id: number;
  dueDate: Date;
  resolvedAt: Date;
  title: string;
  description: string;
  priority: Priority;
  status: Status;

  constructor( taskData: any ) {
    this.id = taskData.id;
    this.dueDate = new Date( taskData.dueDate );
    this.resolvedAt = new Date( taskData.resolvedAt );
    this.title = taskData.title;
    this.description = taskData.description;
    this.priority = Priority[ <string>taskData.priority ];
    this.status = Status[ <string>taskData.status ];
  }

  public resolve() {
    this.status = Status.FINISHED;
    this.resolvedAt = new Date( Date.now() );
  }

  public isFinished() {
    return this.status === Status.FINISHED;
  }
}

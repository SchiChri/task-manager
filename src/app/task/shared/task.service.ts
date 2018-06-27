import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { Task, Priority, Status } from './task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private orderedTasks: Task[];
  private orderedTasks$: BehaviorSubject<Task[]>;

  constructor() {
    this.orderedTasks$ = new BehaviorSubject<Task[]>( this.orderedTasks );
    this.prepareMockedStartTasks();
    this.startRandomMockTaskGeneration();
  }

  /**
   * Get a list of all tasks from the server, ordered by their due-date and
   * priority.
   *
   * @return Observable that resolves with the ordered list of Task objects
   */
  public getOrderedTasks(): Observable<Task[]> {
    return this.orderedTasks$;
  }

  /**
   * Get the data of a specific task.
   * If this task is already known, return the local copy, else request it from
   * the server.
   *
   * @param  taskId the id of the requested task
   * @return        the requested task object
   */
  public getTask( taskId: number ): Observable<Task> {
    let task = _.find( this.orderedTasks, [ 'id', taskId ] );

    if( task ) {  // local copy found
      return Observable.of( task );
    } else {  // no local copy found -> http request to server
      return Observable.of( null ); // TODO replace with request to server
    }
  }

  /**
   * Update an existing task on the server.
   *
   * @param  updatedTask the updated task
   * @return             the updated task as it was returned from the server
   */
  public updateTask( updatedTask: Task ): Observable<Task> {
    let prevTaskIndex = _.findIndex(
      this.orderedTasks, [ 'id', updatedTask.id ]
    );
    let prevTask = this.orderedTasks[ prevTaskIndex ];

    if( prevTask ) {
      if(
        updatedTask.isFinished() &&
        !prevTask.isFinished()
      ) {
        updatedTask.resolve();
      }

      // TODO request to the server to update the task object

      this.orderedTasks[ prevTaskIndex ] = updatedTask;
      this.orderedTasks = this.orderTasks( this.orderedTasks );
      this.orderedTasks$.next( this.orderedTasks );

      return Observable.of( updatedTask );  // for mocking server
    } else {
      throwError( 'Unknown task' );
    }
  }

  public setTaskStatus( task: Task, newTaskStatus: Status ) {
    let prevTask = _.find( this.orderedTasks, [ 'id', task.id ] );

    if( prevTask ) {
      switch( newTaskStatus ) {
        case Status.NEW:
        case Status.IN_PROGRESS:
          prevTask.status = newTaskStatus;
          prevTask.resolvedAt = null;
          break;
        case Status.FINISHED:
          prevTask.resolve();
          break;

      }
      this.orderedTasks = this.orderTasks( this.orderedTasks );
      this.orderedTasks$.next( this.orderedTasks );

      return Observable.of( prevTask );  // for mocking server
    } else {
      throwError( 'Unknown task' );
    }
  }

  /**
   * Order the given tasks array by date and priority.
   */
  private orderTasks( tasks: Task[]): Task[] {
    return _.orderBy(
      tasks,
      [ 'dueDate', 'status', 'priority' ],
      [ 'asc', 'asc', 'desc' ]
    );
  }




  //////////////////////////
  // Mock task data
  //////////////////////////

  /**
   * Prepare the initial mock data.
   */
  private prepareMockedStartTasks(): void {
     let taskData = [
      {
        id: 1,
        dueDate: '2018-06-22T00:00:00',
        resolvedAt: null,
        title: 'Finish Frontend Challenge',
        description: 'Implement the frontend part of a simple task management' +
          ' system. Tasks are created at a randomly time-schedule and should ' +
          'become visible tu the UI.',
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        id: 2,
        dueDate: '2018-07-22T00:00:00',
        resolvedAt: null,
        title: 'Test task 2',
        description: 'Test task 2 description.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS'
      },
      {
        id: 3,
        dueDate: '2018-07-22T00:00:00',
        resolvedAt: null,
        title: 'Test task 3 with higher priority than 2',
        description: 'Test task 3 description. Has higher priority than 2, ' +
          'but same time',
        priority: 'HIGH',
        status: 'NEW'
      },
      {
        id: 4,
        dueDate: '2018-07-22T00:00:00',
        resolvedAt: '2018-06-21T14:09:14',
        title: 'Test task 4 with higher priority than 2',
        description: 'Test task 4 description. Has higher priority than 2, ' +
          'same time as 2 and 3, but is finished',
        priority: 'HIGH',
        status: 'FINISHED'
      },
      {
        id: 5,
        dueDate: '2018-06-04T00:00:00',
        resolvedAt: '2018-06-04T09:48:53',
        title: 'Test task 5',
        description: 'Test task 5 description.',
        priority: 'LOW',
        status: 'FINISHED'
      },
      {
        id: 6,
        dueDate: '2018-07-22T00:00:00',
        resolvedAt: null,
        title: 'Test task 6 with lower priority than 2 and 3',
        description: 'Test task 6 description. Has lower priority than 2 and ' +
          '3.',
        priority: 'LOW',
        status: 'IN_PROGRESS'
      }
    ];

    this.orderedTasks = _.map( taskData, task => new Task( task ) );
    this.orderedTasks = this.orderTasks( this.orderedTasks );
    this.orderedTasks$.next( this.orderedTasks );
  }

  /**
   * Start creation of randomized mock tasks.
   * Infinite loop with timeout.
   */
  private startRandomMockTaskGeneration(): void {
    this.orderedTasks.push( this.createRandomMockTask() );
    this.orderedTasks = this.orderTasks( this.orderedTasks );
    this.orderedTasks$.next( this.orderedTasks );

    // Create another task after random timespan (within next 10 sec)
    setTimeout(
      () => this.startRandomMockTaskGeneration(),
      Math.floor( ( Math.random() * 10 * 1000 ) )
    );
  }

  /**
   * Create a random task with fake text.
   * Only used for mocking the server.
   *
   * @return A new random task object
   */
  private createRandomMockTask(): Task {
    let id = Math.floor( ( Math.random() * 1000000 ) + 6 );
    let newTask = new Task( {
      id: id,
      dueDate: new Date(
        (
          Math.floor( new Date().getTime() / ( 1000 * 60 * 60 * 24 ) ) +
          Math.floor( Math.random() * 30 )
        ) * ( 1000 * 60 * 60 * 24 )
      ),  // random day within the next 30 days
      title: 'Title ' + id,
      description: 'Description of randomly created task with id ' + id,
      priority: Priority[ Math.floor( ( Math.random() * 3 ) + 1 ) ],
      status: Status[ Math.floor( ( Math.random() * 3 ) + 1 ) ]
    } );

    // if task is finished also set random resolved at timestamp within last 30
    // days
    if( newTask.isFinished() ) {
      newTask.resolvedAt = new Date(
        Math.floor( new Date().getTime() ) -
        Math.floor( Math.random() * 1000 * 60 * 60 * 24 * 30 )
      );
    }

    return newTask;
  }
}
